import { ShowActionManager } from "../manageShowActions"
import { ActionParams,  ShowActionSupportArgs } from "./showActionHandler"
import { ShowActionHandlerSupport } from "./ShowActionHandlerSupport"
import { actionStartsWith } from "./utils"

export class ShowBpmActionHandler extends ShowActionHandlerSupport<number>{
  public static DEFAULT_NAME = 'BPM'
  constructor(args?:ShowActionSupportArgs<number>){
    super(ShowBpmActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{ 
    //BPM### is the pattern
    return actionStartsWith(action,this.getName())
  } 
  decodeAction(action: string, showActionMgr: ShowActionManager): ActionParams<number> {
    const bpmResults = super.decodeAction(action,showActionMgr)
    
    if(bpmResults.array.length >= 2){
      const bpm = parseFloat(bpmResults.array[1])
      bpmResults.params = bpm
    }else{
      //fallback support for BPM##
      const bpm = parseFloat(action.substring(3))
      bpmResults.params = bpm
    }
    return bpmResults
  }
  process(action: ActionParams<number>, showActionMgr: ShowActionManager): void {
    showActionMgr.bpm = action.params
    
  }
  execute(action: string, show: ShowActionManager){
    // Change BPM
    super.execute(action,show)
    if (show.randomizerSystem) {
      show.randomizerSystem.reset()
    }
  }
} 
