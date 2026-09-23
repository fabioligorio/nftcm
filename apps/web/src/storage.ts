import {get,set} from 'idb-keyval'
import {emptyState,type State} from './types'
export const readState=async():Promise<State>=>{
 const value=await get<State>('nftcm-workspace-v1')
 if(!value)return emptyState()
 if(value.version!==1||!Array.isArray(value.invoices)||!Array.isArray(value.products)||!value.settings)throw new Error('A base local não pôde ser lida. Ela foi preservada.')
 return value
}
export const writeState=(state:State)=>set('nftcm-workspace-v1',state)