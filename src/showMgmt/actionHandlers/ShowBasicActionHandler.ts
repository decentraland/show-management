import { ShowActionManager } from "../manageShowActions"
import { ShowActionSupportArgs } from "./showActionHandler"
import { ShowActionHandlerSupport } from "./ShowActionHandlerSupport"


export class ShowBasicActionHandler extends ShowActionHandlerSupport<string>{
  constructor(name:string, args:ShowActionSupportArgs<string>){
    super(name, args)
  }
  matches(action: string, showActionMgr: ShowActionManager): boolean{
    return action == this.name
  }
}