import { ShowActionManager } from "../manageShowActions"
import { ActionParams, OnProcessListener, ShowActionHandler, ShowActionSupportArgs } from "./showActionHandler"
import { parseActionWithOpts } from "./utils"

export class ShowActionHandlerSupport<T> implements ShowActionHandler<T>{
  name:string
  callbacks:OnProcessListener<ActionParams<T>>[]
  constructor(name:string,args:ShowActionSupportArgs<T>){
    if(args && args.matches) this.matches = args.matches 
    //if(args && args.execute) this.execute = args.execute 
    this.name = name
    if(args && args.name) this.name = args.name
    if(args && args.decodeAction) this.decodeAction = args.decodeAction
    if(args && args.process) this.process = args.process
  }
  getName(){ return this.name}
  addOnProcessListener(listener:OnProcessListener<ActionParams<T>>){
    if(!this.callbacks) this.callbacks = []
    this.callbacks.push(listener)
  }
  matches(action: string,showActionMgr:ShowActionManager):boolean{ 
    log(this.name,"matches()","implement me",action)
    return false 
  }
  execute(action: string,showActionMgr:ShowActionManager):void{ 
    log("execute called for ",action)
    const decoded:ActionParams<T> = this.decodeAction(action,showActionMgr)
    if(this.process) this.process(decoded,showActionMgr) 
    
    if(this.callbacks){
      for(const p in this.callbacks){
        this.callbacks[p]( decoded,showActionMgr )
      }
    }
  }
  process?(action: ActionParams<T>,showActionMgr:ShowActionManager):void{  
    log(this.name,"process()","implement me",action)
  }

  decodeAction(action: string, showActionMgr: ShowActionManager):ActionParams<T>{
    const parseResult:ActionParams<T> = parseActionWithOpts(action)

    return parseResult;
  }
}
