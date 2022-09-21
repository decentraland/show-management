import { ShowActionManager } from "../manageShowActions"
import { DefineActionParams } from "./DefineActionParams"
import { ActionParams, ShowActionSupportArgs } from "./showActionHandler"
import { ShowActionHandlerSupport } from "./ShowActionHandlerSupport"
import { actionStartsWith, splitByWhiteSpace } from "./utils"


export type DefineTargetGroupType={
  name?:string
  targets?:any[]
  targetNames?:string[]
}

/**
 * 
 * DEFINE TARGET_GROUP GRP_NAME []
 * example
 * DEFINE TARGET_GROUP top_lights light1,light2,light3
 */
export class DefineTargetGroup{
  name?:string
  targetNames:string[]
  targets:any[]
  constructor(args:DefineTargetGroupType){
    this.name = args.name
    if(args.targetNames) this.targetNames = args.targetNames
    if(args.targets  ) this.targets = args.targets  
  }
}

export class DefineTargetGroupActionHandler extends ShowActionHandlerSupport<DefineActionParams<DefineTargetGroupType>>{
  public static DEFAULT_NAME = 'DEFINE TARGET_GROUP'
  constructor(args?:ShowActionSupportArgs<DefineActionParams<DefineTargetGroupType>>){
    super(DefineTargetGroupActionHandler.DEFAULT_NAME,args)
  }

  matches(action: string, showActionMgr: ShowActionManager): boolean {
    //log('CUSTOM matches SAY fired',this.getName(),action)
    return actionStartsWith(action,this.name,0," ") 
  } 
  decodeAction(action: string, showActionMgr: ShowActionManager): ActionParams<DefineActionParams<DefineTargetGroupType>> {

    var result:ActionParams<DefineActionParams<DefineTargetGroupType>>={array:[]}
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
    result.params.opts = {targetNames:targets}
    result.params.opts.name = result.params.name

    return result 
  }
  process(action: ActionParams<DefineActionParams<DefineTargetGroupType>>, showActionMgr: ShowActionManager): boolean {
    //showActionMgr.en
    //action.params.opts.targets
    if(!action.params || !action.params.opts){
      throw new Error("ERROR DefineTargetGroupActionHandler invalid action params")
    }
    showActionMgr.registerShowEntity(action.params.name,new DefineTargetGroup(action.params.opts))
    
    return true
  }
}

