import { ShowActionManager } from '../manageShowActions'

/*
@Component("dcl.show.action.handler")
export class ShowActionMember{
  enabled:boolean
}*/

/**
 * if matches returns true, execute is called.  provided an implementation of decodeAction should you not want to parse action in the execute itself
 */
export type OnProcessListener<T>=(action: T,showActionMgr:ShowActionManager)=>void

export type ActionParams<T>={
  array?:string[]
  params?:T
}

export interface ShowActionHandler<T>{
  /**
   * will test if the action sent can be procssed by this handler  
   * @param action - string of the action to be assessed
   * @param showActionMgr - show action manager 
   * @returns true if can process action, false if not
   */
  matches(action:string,showActionMgr:ShowActionManager):boolean
  /**
   * if matches() returns true, execute will be called to process the action
   * @param action string action to be handled
   * @param showActionMgr 
   */
  execute(action:string,showActionMgr:ShowActionManager):void
  /**
   * returns the action handler name
   */
  getName():string
  /**
   * add listeners to be fired when the handler processes an action
   * @param listener to be added
   */
  addOnProcessListener(listener:OnProcessListener<ActionParams<T>>):void

  /**
   * removes listeners to be fired when the handler processes an action
   * @param listener to be removed
   */
  removeOnProcessListener(listener:OnProcessListener<ActionParams<T>>):void
  
  /**
   * Will decode/parse the action into a more meaningful structure
   * @param action string action to be decoded
   * @param showActionMgr 
   */
  decodeAction(action:string,showActionMgr:ShowActionManager):ActionParams<T>
}

export type ShowActionSupportArgs<T>= {
  matches?(action: string,showActionMgr:ShowActionManager):boolean,
  name?:string
  process?(action: ActionParams<T>,showActionMgr:ShowActionManager):void,
  decodeAction?(action: string,showActionMgr:ShowActionManager):ActionParams<T>
}

