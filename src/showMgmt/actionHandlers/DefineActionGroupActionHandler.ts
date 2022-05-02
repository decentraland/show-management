import { ShowActionManager } from "../manageShowActions"
import { DefineActionParams } from "./DefineActionParams"


import { ActionParams,  ShowActionSupportArgs } from "./showActionHandler"
import { ShowActionHandlerSupport } from "./ShowActionHandlerSupport"
import { actionStartsWith, splitByWhiteSpace } from "./utils"


export type DefineActionGroupType={
  actions?:string[]
}

export class DefineActionGroupActionHandler extends ShowActionHandlerSupport<DefineActionParams<DefineActionGroupType>>{
  public static DEFAULT_NAME = 'DEFINE ACTION_GROUP'
  constructor(args?:ShowActionSupportArgs<DefineActionParams<DefineActionGroupType>>){
    super(DefineActionGroupActionHandler.DEFAULT_NAME,args)
  }

  matches(action: string, showActionMgr: ShowActionManager): boolean {
    //log('CUSTOM matches SAY fired',action)
    return actionStartsWith(action,this.name,0," ")
  }
  decodeAction(action: string, showActionMgr: ShowActionManager): ActionParams<DefineActionParams<DefineActionGroupType>> {
    var result:ActionParams<DefineActionParams<DefineActionGroupType>>={array:[]}
    const arr = splitByWhiteSpace(action)
 
    result.array = arr
  
    //convert to type
    result.params = { type: arr[1],name:arr[2] }

    const targets:string[] = []
    for(let x=3;x<arr.length;x++){
      const val:string[] = arr[x].split(",")
      for(const p in val){
        targets.push(val[p].trim())
      }
    }
    result.params.opts = {actions:targets}
    
    return result    
  }
  process(action: ActionParams<DefineActionParams<DefineActionGroupType>>, showActionMgr: ShowActionManager): boolean {
    //register the alias as a new action handler ... very meta
 
    //TODO

    return true
  }
}

