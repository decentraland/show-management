
//beats might need this param

import { ShowActionManager } from "../manageShowActions"
import { ActionParams, ShowActionSupportArgs } from "./showActionHandler"
import { ShowActionHandlerSupport } from "./ShowActionHandlerSupport"
import { actionStartsWith } from "./utils"

//not ready yet
class RandomizerActionHandler extends ShowActionHandlerSupport<number>{
  public static DEFAULT_NAME = 'RANDOMIZE'
  constructor(args?:ShowActionSupportArgs<number>){
    super(RandomizerActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{ 
    //BPM### is the pattern
    return actionStartsWith(action,this.getName())
  } 
  decodeAction(action: string, showActionMgr: ShowActionManager): ActionParams<number> {
    const results = super.decodeAction(action,showActionMgr)
    
    //TODO

    return results
  }
  process(action: ActionParams<number>, showActionMgr: ShowActionManager): void {
    //showActionMgr.randomizerSystem.events = 
    
  }
} 

