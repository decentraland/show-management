import { ShowActionManager } from "../manageShowActions"
import { ActionParams,  ShowActionSupportArgs } from "./showActionHandler"
import { ShowActionHandlerSupport } from "./ShowActionHandlerSupport"
import { actionStartsWith } from "./utils"

export type ActionHandlerAnimationParams={
  target:string
  animationName:string
  loop?:boolean //defaults true
  duration?:number,
  speed?: number,
  interval?: number,
  resetAnimation?: boolean
  layer?:number,
  play?:boolean,
  bpmSync?:boolean
}


export class ShowAnimationActionHandler extends ShowActionHandlerSupport<ActionHandlerAnimationParams>{
  public static DEFAULT_NAME = 'ANIMATE'
  /*
  animationName: string,
    noLoop?: boolean,
    duration?: number,
    speed?: number,
    interval?: number,
    resetAnim?: boolean

  pattern():string{
    return 'ANIMATE:{TARGET}:options
    {ANIMATIONNAME}:{LOOP}:{DURATION}:{SPEED}:INTERVAL:RESETNIM'
    --start
    ANIMATE : stage_lights_top : {"animationName":"strobe"}
    --stop
    ANIMATE : stage_lights_top : {"animationName":"strobe", "play":false}
    --play for 2 seconds and stops itself
    ANIMATE : stage_lights_top : {"animationName":"strobe", "duration":2}
  }*/
  constructor(args:ShowActionSupportArgs<ActionHandlerAnimationParams>){
    super(ShowAnimationActionHandler.DEFAULT_NAME,args)
  }

  decodeAction(action: string, showActionMgr: ShowActionManager):ActionParams<ActionHandlerAnimationParams>{
    //splits into 3 COMMAND TARGET OPTIONS
    const parseResult:ActionParams<ActionHandlerAnimationParams> = super.decodeAction(action,showActionMgr)
  
    const obj = parseResult.params

    obj.target = parseResult.array[1]
    if(obj.bpmSync !== undefined && obj.bpmSync){
      obj.speed = showActionMgr.bpm / 120
    }

    return parseResult;
  }
  matches(action: string):boolean{
    return actionStartsWith(action,this.getName(),0," ")
  }
}

