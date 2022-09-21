
//DEFINE ACTION CUST_ACTION ACTION.....
//example

import { ShowActionManager } from "../manageShowActions"
import { DefineActionParams } from "./DefineActionParams"
import { ActionParams, ShowActionSupportArgs } from "./showActionHandler"
import { ShowActionHandlerSupport } from "./ShowActionHandlerSupport"
import { ShowBasicActionHandler } from "./ShowBasicActionHandler"
import { actionStartsWith, splitByWhiteSpace } from "./utils"


export type DefineActionAlias={
  action:string
}


//DEFINE ACTION DEF_SAY_HI SAY "hi"
export class DefineActionAliasActionHandler extends ShowActionHandlerSupport<DefineActionParams<DefineActionAlias>>{
  public static DEFAULT_NAME = 'DEFINE ACTION'
  constructor(args?:ShowActionSupportArgs<DefineActionParams<DefineActionAlias>>){
    super(DefineActionAliasActionHandler.DEFAULT_NAME,args)
  }

  matches(action: string, showActionMgr: ShowActionManager): boolean {
    //log('CUSTOM matches SAY fired',action)
    return actionStartsWith(action,this.name,0," ")
  }
  decodeAction(action: string, showActionMgr: ShowActionManager): ActionParams<DefineActionParams<DefineActionAlias>> {
    var result:ActionParams<DefineActionParams<DefineActionAlias>>={array:[]}
    const arr = splitByWhiteSpace(action)

    result.array = arr

    const optArr = arr.length > 3 ? arr.splice(3).join(" ") : undefined

    //convert to type
    result.params = { type: arr[1],name:arr[2], opts: {action: (optArr) ? optArr : "unknown"} }
    
    return result
  }
  process(action: ActionParams<DefineActionParams<DefineActionAlias>>, showActionMgr: ShowActionManager): boolean {
    //register the alias as a new action handler ... very meta
    
    const mainProcessActionArg = action
    
    if(mainProcessActionArg === undefined || mainProcessActionArg.params === undefined ||
      mainProcessActionArg.params.opts === undefined ){
      throw new Error("ERROR DefineActionAliasActionHandler invalid action")
    }
    //const handler = new ...
    showActionMgr.registerHandler( 
      new ShowBasicActionHandler( mainProcessActionArg.params.name,
        {
          process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
            //debugger
            if(mainProcessActionArg === undefined || mainProcessActionArg.params === undefined ||
              mainProcessActionArg.params.opts === undefined){
                throw new Error("ERROR DefineActionAliasActionHandler invalid action")
            }
            log("DefineActionAliasActionHandler handling action",action)
            
            showActionMgr.runAction( mainProcessActionArg.params.opts.action )
            return true
          }
        } )
     )
    
    return true
  }
}