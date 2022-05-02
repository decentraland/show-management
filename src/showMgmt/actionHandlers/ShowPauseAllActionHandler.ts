import { ShowActionManager } from "../manageShowActions"
import { ActionParams, ShowActionSupportArgs, ShowBasicActionHandler } from "./showActionHandler"
import { actionStartsWith } from "./utils"

export class ShowPauseAllActionHandler extends ShowBasicActionHandler{
  public static DEFAULT_NAME = 'PAUSEALL'
  constructor(args:ShowActionSupportArgs<string>){
    super(ShowPauseAllActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return actionStartsWith(action,this.getName(),0," ")
  }
  process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
    log('PAUSEALL ALL ')
    return true
  }
}

