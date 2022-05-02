import * as utils from '@dcl/ecs-scene-utils'
import { ShowActionManager } from '../manageShowActions'
import { ShowActionHandlerSupport } from './ShowActionHandlerSupport'
import { actionStartsWith, parseActionWithOpts } from './utils'

/*
@Component("dcl.show.action.handler")
export class ShowActionMember{
  enabled:boolean
}*/

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

export type OnProcessListener<T>=(action: T,showActionMgr:ShowActionManager)=>void


export class ShowBasicActionHandler extends ShowActionHandlerSupport<string>{
  constructor(name:string, args:ShowActionSupportArgs<string>){
    super(name, args)
  }
  matches(action: string, showActionMgr: ShowActionManager): boolean{
    return action == this.name
  }
}


export type ActionParams<T>={
  array?:string[]
  params?:T
}
