import { ShowActionManager } from "../manageShowActions"
import {  ShowActionSupportArgs } from "./showActionHandler"
import { ShowActionHandlerSupport } from "./ShowActionHandlerSupport"
import { actionStartsWith } from "./utils"


export type ActionHandlerAnouncementParams={
  text:string
  duration?:number
  color?:string
}

export class ShowAnounceActionHandler extends ShowActionHandlerSupport<ActionHandlerAnouncementParams>{
  public static DEFAULT_NAME = 'ANNOUNCE'
  constructor(args:ShowActionSupportArgs<ActionHandlerAnouncementParams>){
    super(ShowAnounceActionHandler.DEFAULT_NAME,args)
  }

  matches(action: string, showActionMgr: ShowActionManager): boolean {
    //log('CUSTOM matches SAY fired',action)
    return actionStartsWith(action,this.name,0," ")
  }
}
