import {defaults,type State,type Invoice} from './types'
export function demoState():State {
 const products=[{id:'aco',name:'Aço mola SAE 5160',unit:'KG'},{id:'parafuso',name:'Parafuso sextavado M12',unit:'UN'},{id:'bucha',name:'Bucha de suspensão',unit:'UN'},{id:'arruela',name:'Arruela de pressão M12',unit:'UN'}]
 const suppliers=[['Aços Paraná','11111111000191','PR'],['Metalúrgica Sul','22222222000191','SC'],['Fixadores Curitiba','33333333000191','PR'],['Industrial Paulista','44444444000191','SP']]
 const prices=[10,10.2,10.4,11,11.4,11.8],totals=[32000,38500,36000,42000,46000,54000]
 const invoices:Invoice[]=[]
 for(let m=0;m<6;m++)for(let k=0;k<4;k++){
  const sup=suppliers[k],total=totals[m]/4,steelValue=prices[m]*200
  invoices.push({key:'DEMO-'+m+'-'+k,number:String(1024+m*4+k),date:'2026-'+String(m+1).padStart(2,'0')+'-'+String(5+k*6).padStart(2,'0'),supplier:sup[0],supplierId:sup[1],supplierUF:sup[2],recipientId:'00000000000100',recipientUF:'PR',region:sup[2]==='PR'?'Interna':'Interestadual',total,nature:'Venda de mercadorias',status:'Aprovada',reasons:[],origins:[(['Francislei','Junio','Carlos'] as const)[k%3]],protocol:true,importedAt:'2026-07-01T12:00:00Z',demo:true,items:[{id:'1',code:'ACO-5160',description:products[0].name,unit:'KG',quantity:200,value:steelValue,discount:0,cfop:'5102',productId:'aco',factor:1},{id:'2',code:'FIX-'+k,description:products[1+k%3].name,unit:'UN',quantity:500,value:total-steelValue,discount:0,cfop:'5102',productId:products[1+k%3].id,factor:1}]})
 }
 invoices.push({...invoices[0],key:'DEMO-PENDENTE',number:'1050',date:'2026-06-28',status:'Pendente',total:1920,protocol:false,reasons:['Protocolo de autorização ausente.','Conferir natureza da compra.'],items:[{id:'1',code:'BUCHA-X',description:'Bucha de suspensão especial',unit:'UN',quantity:100,value:1920,discount:0,cfop:'5102'}]})
 return {version:1,invoices,products,settings:{...defaults},audit:[]}
}