export type Origin = 'Francislei' | 'Junio' | 'Carlos' | 'Importação manual'
export type Region = 'Interna' | 'Interestadual' | 'Exterior' | 'A revisar'
export type Status = 'Pendente' | 'Aprovada' | 'Cancelada' | 'Fora do escopo'
export interface Item { id:string; code:string; description:string; unit:string; quantity:number; value:number; discount:number; cfop:string; productId?:string; factor?:number }
export interface Invoice {key:string; number:string; date:string; supplier:string; supplierId:string; supplierUF:string; recipientId:string; recipientUF:string; region:Region; total:number; nature:string; status:Status; reasons:string[]; origins:Origin[]; items:Item[]; xml?:string; protocol:boolean; importedAt:string; demo?:boolean}
export interface Product {id:string; name:string; unit:string}
export interface Audit {id:string; date:string; message:string}
export interface Settings {company:string; cnpj:string; uf:string; centralEmail:string; threshold:number}
export interface State {version:1; invoices:Invoice[]; products:Product[]; settings:Settings; audit:Audit[]}
export const defaults:Settings={company:'Molaço',cnpj:'',uf:'PR',centralEmail:'',threshold:10}
export const emptyState=():State=>({version:1,invoices:[],products:[],settings:{...defaults},audit:[]})