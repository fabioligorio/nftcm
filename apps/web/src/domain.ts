import type {Invoice,Item,Origin,Product,Region,Settings} from './types'
export const currency=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const number=(value:number)=>value.toLocaleString('pt-BR',{maximumFractionDigits:2})
export const shortDate=(date:string)=>new Date(date+'T12:00:00').toLocaleDateString('pt-BR')
export const eligible=(n:Invoice)=>n.status==='Aprovada'&&(n.region==='Interna'||n.region==='Interestadual')
const children=(node:Element,name:string)=>Array.from(node.children).filter(n=>n.localName===name)
const path=(node:Element|undefined,...parts:string[]):Element|undefined=>parts.reduce<Element|undefined>((n,key)=>n?children(n,key)[0]:undefined,node)
const value=(node:Element|undefined,...parts:string[])=>path(node,...parts)?.textContent?.trim()||''
function decimal(node:Element|undefined, required:boolean, ...parts:string[]) {
 const raw=value(node,...parts)
 if(!raw&&!required)return 0
 if(!/^\d+(\.\d+)?$/.test(raw))throw new Error('Valor inválido em '+parts.join('/'))
 const n=Number(raw);if(!Number.isFinite(n))throw new Error('Valor fora do limite')
 return n
}
export function validKey(key:string){
 if(!/^\d{44}$/.test(key))return false
 let sum=0,weight=2;for(let i=42;i>=0;i--){sum+=Number(key[i])*weight;weight=weight===9?2:weight+1}
 const digit=11-sum%11;return Number(key[43])===(digit>=10?0:digit)
}
export function parseInvoice(xml:string,origin:Origin,settings:Settings):Invoice{
 if(xml.length>2_000_000)throw new Error('O XML excede o limite de 2 MB.')
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw new Error('XML com entidades externas não é permitido.')
 const doc=new DOMParser().parseFromString(xml,'application/xml')
 if(doc.getElementsByTagName('parsererror').length)throw new Error('XML inválido.')
 const info=doc.getElementsByTagNameNS('*','infNFe')[0]
 if(!info||doc.getElementsByTagNameNS('*','infNFe').length!==1)throw new Error('Envie um XML contendo uma NF-e.')
 const key=(info.getAttribute('Id')||'').replace(/^NFe/,'')
 if(!validKey(key))throw new Error('Chave de acesso da NF-e inválida.')
 if(value(info,'ide','mod')!=='55')throw new Error('Este MVP importa NF-e de mercadorias, modelo 55.')
 const date=value(info,'ide','dhEmi').slice(0,10)||value(info,'ide','dEmi')
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw new Error('Data de emissão inválida.')
 const supplier=value(info,'emit','xNome'), supplierId=value(info,'emit','CNPJ')
 const recipientId=value(info,'dest','CNPJ'),supplierUF=value(info,'emit','enderEmit','UF'),recipientUF=value(info,'dest','enderDest','UF')
 if(!supplier||!supplierId||!recipientId)throw new Error('Emitente ou destinatário sem CNPJ/nome.')
 const dest=value(info,'ide','idDest')
 const region:Region=dest==='3'?'Exterior':dest==='1'&&supplierUF===recipientUF?'Interna':dest==='2'&&supplierUF!==recipientUF?'Interestadual':'A revisar'
 const reasons:string[]=[]
 if(!settings.cnpj)reasons.push('Cadastre o CNPJ destinatário nas configurações.')
 else if(settings.cnpj.replace(/\D/g,'')!==recipientId)reasons.push('CNPJ destinatário diferente da unidade cadastrada.')
 if(settings.uf!==recipientUF)reasons.push('UF destinatária diferente da unidade cadastrada.')
 if(region==='A revisar')reasons.push('Destino da operação e UFs precisam de conferência.')
 if(region==='Exterior')reasons.push('Operação com exterior: fora das compras nacionais.')
 if(value(info,'ide','finNFe')!=='1')reasons.push('Finalidade diferente de NF-e normal; revisar natureza do movimento.')
 const protocolInfo=doc.getElementsByTagNameNS('*','infProt')[0]
 const protocol=!!protocolInfo&&['100','150'].includes(value(protocolInfo,'cStat'))&&value(protocolInfo,'chNFe')===key
 if(!protocol)reasons.push('Protocolo de autorização ausente ou não compatível.')
 const items:Item[]=children(info,'det').map((det,index)=>{
  const prod=path(det,'prod'),quantity=decimal(prod,true,'qCom')
  const item={id:det.getAttribute('nItem')||String(index+1),code:value(prod,'cProd'),description:value(prod,'xProd'),unit:value(prod,'uCom').toUpperCase(),quantity,value:decimal(prod,true,'vProd'),discount:decimal(prod,false,'vDesc'),cfop:value(prod,'CFOP')}
  if(!quantity||!item.description||!item.unit||item.discount>item.value)throw new Error('Item com quantidade, descrição, unidade ou desconto inválido.')
  return item
 })
 if(!items.length||new Set(items.map(i=>i.id)).size!==items.length)throw new Error('Itens ausentes ou duplicados.')
 reasons.push('Conferir se a natureza e o CFOP representam compra de mercadorias.')
 return {key,number:value(info,'ide','nNF'),date,supplier,supplierId,supplierUF,recipientId,recipientUF,region,total:decimal(path(info,'total','ICMSTot'),true,'vNF'),nature:value(info,'ide','natOp'),status:'Pendente',reasons,origins:[origin],items,xml,protocol,importedAt:new Date().toISOString()}
}
export function mergeInvoice(invoices:Invoice[],incoming:Invoice){
 const existing=invoices.find(n=>n.key===incoming.key)
 if(!existing)return {invoices:[incoming,...invoices],duplicate:false}
 const signature=(n:Invoice)=>JSON.stringify([n.number,n.date,n.supplierId,n.supplierUF,n.recipientId,n.recipientUF,n.total,n.nature,n.region,n.items.map(i=>[i.id,i.code,i.description,i.unit,i.quantity,i.value,i.discount,i.cfop])])
 if(signature(existing)!==signature(incoming))throw new Error('Conflito: a mesma chave já existe com dados diferentes. O original foi preservado.')
 return {invoices:invoices.map(n=>n.key===incoming.key?{...n,origins:[...new Set([...n.origins,...incoming.origins])]}:n),duplicate:true}
}
export function productStats(invoices:Invoice[],products:Product[]){
 return products.map(product=>{
  const rows=invoices.filter(eligible).flatMap(n=>n.items.filter(i=>i.productId===product.id&&(i.factor||0)>0).map(i=>({date:n.date,key:n.key,supplier:n.supplier,item:i,quantity:i.quantity*i.factor!,net:i.value-i.discount}))).sort((a,b)=>a.date.localeCompare(b.date))
  const quantity=rows.reduce((s,r)=>s+r.quantity,0),net=rows.reduce((s,r)=>s+r.net,0),latest=rows.at(-1)
  return {...product,rows,quantity,net,average:quantity?net/quantity:0,last:latest?latest.net/latest.quantity:0,count:new Set(rows.map(r=>r.key)).size}
 })
}
export function periodComparison(invoices:Invoice[],productId:string,months:3|6,asOf:string){
 const date=new Date(asOf+'T00:00:00Z'),start=new Date(Date.UTC(date.getUTCFullYear(),Math.floor(date.getUTCMonth()/months)*months,1))
 const currentStart=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()-months,1)).toISOString().slice(0,10)
 const previousStart=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()-months*2,1)).toISOString().slice(0,10),end=start.toISOString().slice(0,10)
 const average=(from:string,to:string)=>{
  const rows=invoices.filter(n=>eligible(n)&&n.date>=from&&n.date<to).flatMap(n=>n.items).filter(i=>i.productId===productId&&(i.factor||0)>0)
  const q=rows.reduce((s,i)=>s+i.quantity*i.factor!,0)
  return q?rows.reduce((s,i)=>s+i.value-i.discount,0)/q:null
 }
 const current=average(currentStart,end),previous=average(previousStart,currentStart)
 return {current,previous,currentStart,previousStart,end,variation:current!==null&&previous!==null&&previous>0?(current/previous-1)*100:null}
}
export function csv(rows:(string|number)[][]){
 return '\ufeff'+rows.map(row=>row.map(cell=>{let s=String(cell);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}).join(';')).join('\r\n')
}