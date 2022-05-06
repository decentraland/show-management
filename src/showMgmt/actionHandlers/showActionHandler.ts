import { ShowActionManager } from '../manageShowActions'

/*
@Component("dcl.show.action.handler")
export class ShowActionMember{
  enabled:boolean
}*/


export type OnProcessListener<T>=(action: T,showActionMgr:ShowActionManager)=>void

export type ActionParams<T>={
  array?:string[]
  params?:T
}

export interface ShowActionHandler<T>{
  //name:string
  matches(action:string,showActionMgr:ShowActionManager):boolean
  execute(action:string,showActionMgr:ShowActionManager):void
  /**
   * returns the command name
   */
  getName():string

  addOnProcessListener(listener:OnProcessListener<ActionParams<T>>):void
  /**
   * returns the pattern it matches on
   */
  //pattern:()=>string
  /**
   * true means no more handlers processed
   */
  //isLast():boolean
  decodeAction(action:string,showActionMgr:ShowActionManager):ActionParams<T>
}

export type ShowActionSupportArgs<T>= {
  matches?(action: string,showActionMgr:ShowActionManager):boolean,
  name?:string
  process?(action: ActionParams<T>,showActionMgr:ShowActionManager):void,
  decodeAction?(action: string,showActionMgr:ShowActionManager):ActionParams<T>
}

