import { ShowActionManager } from "../manageShowActions"
import { ActionParams, ShowActionSupportArgs } from "./showActionHandler"
import { ShowBasicActionHandler } from "./ShowBasicActionHandler"
import { actionStartsWith } from "./utils"

export class ShowStopAllActionHandler extends ShowBasicActionHandler{
  public static DEFAULT_NAME = 'STOPALL'
  constructor(args?:ShowActionSupportArgs<string>){
    super(ShowStopAllActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return actionStartsWith(action,this.getName(),0," ")
  }
  process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
    log('STOP ALL ')
    return true
  }
}
