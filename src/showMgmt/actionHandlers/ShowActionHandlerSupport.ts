import { Logger, LoggerFactory } from "../../logging/logging"
import { ShowActionManager } from "../manageShowActions"
import { removeItemFromArray } from "../utils"
import { ActionParams, OnProcessListener, ShowActionHandler, ShowActionSupportArgs } from "./showActionHandler"
import { parseActionWithOpts } from "./utils"

/**
 * Base helper implementation of action handler
 * 
 */
export class ShowActionHandlerSupport<T> implements ShowActionHandler<T>{
  name:string
  callbacks?:OnProcessListener<ActionParams<T>>[]
  logger:Logger
  constructor(name:string,args?:ShowActionSupportArgs<T>){
    if(args && args.matches) this.matches = args.matches 
    //if(args && args.execute) this.execute = args.execute 
    this.name = name
    if(args && args.name) this.name = args.name
    if(args && args.decodeAction) this.decodeAction = args.decodeAction
    if(args && args.process) this.process = args.process
    this.logger = LoggerFactory.getLogger("ShowActionHandler."+name)
  }
  getName(){ return this.name}
  addOnProcessListener(listener:OnProcessListener<ActionParams<T>>){
    if(!this.callbacks) this.callbacks = []
    this.callbacks.push(listener)
  }
  removeOnProcessListener(listener:OnProcessListener<ActionParams<T>>) {
    if(!this.callbacks && this.callbacks !== undefined) this.callbacks = removeItemFromArray(this.callbacks,listener)
  }
  matches(action: string,showActionMgr:ShowActionManager):boolean{ 
    const METHOD_NAME = "matches()"
    this.logger.debug(METHOD_NAME,"implement me!!",action)
    return false 
  }
  execute(action: string,showActionMgr:ShowActionManager):void{ 
    const METHOD_NAME = "execute"
    this.logger.trace(METHOD_NAME," called ",action)
    const decoded:ActionParams<T> = this.decodeAction(action,showActionMgr)
    if(this.process) this.process(decoded,showActionMgr) 
    if(this.processExt) this.processExt(decoded,showActionMgr) 

    
    if(this.callbacks){
      for(const p in this.callbacks){
        this.callbacks[p]( decoded,showActionMgr )
      }
    }
  }
  process?(action: ActionParams<T>,showActionMgr:ShowActionManager):void{  
    const METHOD_NAME = "process()"
    this.logger.debug(METHOD_NAME,"implement me!!",action)
  }

  /**
   * override or extend me when you dont want to overrload process method
   * @param action 
   * @param showActionMgr 
   */
  processExt?(action: ActionParams<T>,showActionMgr:ShowActionManager):void{  
    //const METHOD_NAME = "processExt()"
    //this.logger.debug(METHOD_NAME,"implement me!!",action)
  }

  decodeAction(action: string, showActionMgr: ShowActionManager):ActionParams<T>{
    const METHOD_NAME = "decodeAction()"
    this.logger.trace(METHOD_NAME," called ",action)

    const parseResult:ActionParams<T> = parseActionWithOpts(action)
    
    this.logger.trace(METHOD_NAME," parse result ",action,parseResult)

    return parseResult;
  }
}
