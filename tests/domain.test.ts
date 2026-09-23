import {describe,it,expect} from 'vitest'
import {parseInvoice,mergeInvoice,productStats,periodComparison,csv,validKey,eligible} from '../apps/web/src/domain'
import {defaults,type Invoice} from '../apps/web/src/types'
import {demoState} from '../apps/web/src/demo'
const base='4126061234567800019055001000000001100000000'
function withCheck(s:string){let sum=0;for(let i=s.length-1,w=2;i>=0;i--,w=w===9?2:w+1)sum+=Number(s[i])*w;const n=11-sum%11;return s+(n>=10?0:n)}
export const key=withCheck(base)
const settings={...defaults,cnpj:'00000000000100'}
const xml='<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe'+key+'"><ide><mod>55</mod><nNF>1</nNF><dhEmi>2026-06-10T12:00:00-03:00</dhEmi><idDest>1</idDest><finNFe>1</finNFe><natOp>Venda de mercadorias</natOp></ide><emit><CNPJ>12345678000190</CNPJ><xNome>Fornecedor de teste</xNome><enderEmit><UF>PR</UF></enderEmit></emit><dest><CNPJ>00000000000100</CNPJ><enderDest><UF>PR</UF></enderDest></dest><det nItem="1"><prod><cProd>ACO</cProd><xProd>Aço teste</xProd><uCom>KG</uCom><qCom>100</qCom><vProd>1000</vProd><vDesc>50</vDesc><CFOP>5102</CFOP></prod></det><total><ICMSTot><vNF>950</vNF></ICMSTot></total></infNFe></NFe><protNFe><infProt><cStat>100</cStat><chNFe>'+key+'</chNFe></infProt></protNFe></nfeProc>'
describe('Importação fiscal',()=>{
 it('lê NF-e com namespace e exige revisão mesmo com protocolo',()=>{expect(key).toHaveLength(44);expect(validKey(key)).toBe(true);const n=parseInvoice(xml,'Francislei',settings);expect(n.region).toBe('Interna');expect(n.status).toBe('Pendente');expect(n.protocol).toBe(true);expect(n.total).toBe(950);expect(n.items[0].discount).toBe(50)})
 it('rejeita XML inválido, entidade externa e chave incorreta',()=>{expect(()=>parseInvoice('<bad>','Carlos',settings)).toThrow();expect(()=>parseInvoice('<!DOCTYPE x>'+xml,'Carlos',settings)).toThrow(/entidades/);expect(()=>parseInvoice(xml.replace('Id="NFe'+key,'Id="NFe'+key.slice(0,-1)+(Number(key.at(-1))===9?'0':'9')),'Carlos',settings)).toThrow(/Chave/)})
 it('mantém CNPJ desconhecido, conflito territorial e protocolo ausente em revisão',()=>{const n=parseInvoice(xml.replace('<idDest>1','<idDest>2').replace('<cStat>100','<cStat>101'),'Carlos',{...settings,cnpj:'99999999999999'});expect(n.region).toBe('A revisar');expect(n.protocol).toBe(false);expect(n.reasons.join(' ')).toMatch(/CNPJ destinatário diferente/)})
 it('recusa quantidade zero, data impossível e descontos maiores que item',()=>{for(const text of [xml.replace('<qCom>100','<qCom>0'),xml.replace('2026-06-10','2026-02-30'),xml.replace('<vDesc>50','<vDesc>1001')])expect(()=>parseInvoice(text,'Carlos',settings)).toThrow()})
 it('deduplica entre origens e mantém decisão anterior',()=>{const n=parseInvoice(xml,'Francislei',settings);n.status='Aprovada';const m=mergeInvoice([n],parseInvoice(xml,'Carlos',settings));expect(m.duplicate).toBe(true);expect(m.invoices).toHaveLength(1);expect(m.invoices[0].origins).toEqual(['Francislei','Carlos']);expect(m.invoices[0].status).toBe('Aprovada')})
 it('não sobrescreve uma chave com conteúdo divergente',()=>{const n=parseInvoice(xml,'Francislei',settings);expect(()=>mergeInvoice([n],{...n,total:2000})).toThrow(/Conflito/);expect(n.total).toBe(950)})
})
describe('Análises de compras',()=>{
 it('reconcilia total demonstrativo sem incluir pendências',()=>expect(demoState().invoices.filter(eligible).reduce((s,n)=>s+n.total,0)).toBe(248500))
 it('calcula preço ponderado e converte quantidade, não média simples',()=>{const n=demoState().invoices[0];const a:Invoice={...n,key:'a',items:[{...n.items[0],quantity:10,factor:10,value:1000,discount:0}]},b:Invoice={...n,key:'b',items:[{...n.items[0],quantity:300,factor:1,value:3600,discount:0}]};const p=productStats([a,b],demoState().products)[0];expect(p.quantity).toBe(400);expect(p.average).toBe(11.5);expect(p.count).toBe(2)})
 it('recorrência não duplica linhas do mesmo produto na mesma nota',()=>{const n=demoState().invoices[0];const p=productStats([{...n,items:[n.items[0],{...n.items[0],id:'3'}]}],demoState().products)[0];expect(p.count).toBe(1)})
 it('compara trimestres completos, sem usar o trimestre em andamento',()=>{const d=demoState();const result=periodComparison(d.invoices,'aco',3,'2026-09-23');expect(result.previousStart).toBe('2026-01-01');expect(result.currentStart).toBe('2026-04-01');expect(result.end).toBe('2026-07-01');expect(result.variation).toBeCloseTo(11.7647,3)})
 it('falta de período e cancelamento não viram preço zero',()=>{const d=demoState();expect(periodComparison(d.invoices,'aco',6,'2026-09-23').variation).toBeNull();expect(productStats(d.invoices.map(n=>({...n,status:'Cancelada'})),d.products)[0].quantity).toBe(0)})
 it('protege CSV de fórmulas e escapa aspas',()=>{const output=csv([['=HYPERLINK("x")','a;b']]);expect(output).toContain("'=HYPERLINK");expect(output).toContain('""x""');expect(output).toContain('"a;b"')})
})
