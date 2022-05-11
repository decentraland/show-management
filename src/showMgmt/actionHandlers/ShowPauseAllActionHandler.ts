import { ShowActionManager } from "../manageShowActions"
import { ShowEntityModel } from "../showEntity/showEntityModel"
import { ActionParams, ShowActionSupportArgs } from "./showActionHandler"
import { ShowBasicActionHandler } from "./ShowBasicActionHandler"
import { actionStartsWith } from "./utils"

export class ShowPauseAllActionHandler extends ShowBasicActionHandler{
  public static DEFAULT_NAME = 'PAUSEALL'
  constructor(args?:ShowActionSupportArgs<string>){
    super(ShowPauseAllActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return actionStartsWith(action,this.getName(),0," ")
  }
  process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
    const METHOD_NAME = "process"
    //pause action goes here
    //some actions "stop" is a play or hide or show or stop

    //for now mass stopping everything
    for(const p in showActionMgr.registeredShowEntities){
      const obj = showActionMgr.registeredShowEntities[p] 

      this.pauseEntity(obj)
    }
    return true
  }

  pauseEntity(obj: any) {
    const METHOD_NAME = "pauseEntity"
    if(obj instanceof ShowEntityModel){
      var showEnt = obj as ShowEntityModel
      
      this.logger.debug(METHOD_NAME,"pause/stopping",showEnt.entity.name)
      showEnt.stopAllAnimations()
    }else{
      this.logger.debug(METHOD_NAME,"not a ShowEntityModel",obj.name)
    }
  }
  
}

