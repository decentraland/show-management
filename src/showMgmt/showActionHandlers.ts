import * as utils from '@dcl/ecs-scene-utils'
import { ShowManager } from './manageShow'
import { ShowActionManager } from './manageShowActions'

@Component("dcl.show.action.handler")
export class ShowActionMember{
  enabled:boolean
}

export interface ShowActionHandler{
  //name:string
  matches:(action:string,showActionMgr:ShowActionManager)=>boolean
  execute:(action:string,showActionMgr:ShowActionManager)=>void
  /**
   * returns the command name
   */
  getName:()=>string
  /**
   * returns the pattern it matches on
   */
  //pattern:()=>string
  /**
   * true means no more handlers processed
   */
  //isLast():boolean
}

export interface ShowDynamicActionHandler<T> extends ShowActionHandler{
  decodeAction:(action:string,showActionMgr:ShowActionManager)=>T
}

export type ShowActionSupportArgs={
  
}

export type ShowDynamicActionSupportArgs<T>= {
  name:string
  matches?(action: string,showActionMgr:ShowActionManager):boolean,
  execute?(action: string,showActionMgr:ShowActionManager):void,
  process?(action: T,showActionMgr:ShowActionManager):void,
  decodeAction?(action: string,showActionMgr:ShowActionManager):T
}
  
export class ShowDynamicActionSupport<T> implements ShowDynamicActionHandler<T>{
  name:string
  constructor(args:ShowDynamicActionSupportArgs<T>){
    if(args.matches) this.matches = args.matches 
    if(args.execute) this.execute = args.execute 
    if(args.name) this.name = args.name
    if(args.decodeAction) this.decodeAction = args.decodeAction
    if(args.process) this.process = args.process
  }
  getName(){ return this.name}
  matches(action: string,showActionMgr:ShowActionManager):boolean{ 
    log("OOTB matches called for ",action)
    return false 
  }
  execute(action: string,showActionMgr:ShowActionManager):void{ 
    log("execute called for ",action)
    this.process(this.decodeAction(action,showActionMgr),showActionMgr) 
  }
  process?(action: T,showActionMgr:ShowActionManager):void{  }
  decodeAction(action: string, showActionMgr: ShowActionManager):T{
    log("OOTB decodeAction called for ",action)
    return undefined;
  }
}

export class ShowStringActionHandler extends ShowDynamicActionSupport<string>{
  constructor(args:ShowDynamicActionSupportArgs<string>){
    super(args)
  }
}


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


export class ShowAnimationActionHandler extends ShowDynamicActionSupport<ActionHandlerAnimationParams>{
  static DEFAULT_NAME = 'ANIMATE'
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
    ANIMATE : stage_lights_top : {animationName:'strobe'}
    --stop
    ANIMATE : stage_lights_top : {animationName:'strobe', play:false}

    --play for 2 seconds and stops itself
    ANIMATE : stage_lights_top : {animationName:'strobe', duration:2}
  }*/
  name:'ANIMATE'
  //isLast(action: string):boolean{ return false }
  decodeAction(action: string, showActionMgr: ShowActionManager):ActionHandlerAnimationParams{
    //splits into 3 COMMAND TARGET OPTIONS
    const arr = action.split(/([a-zA-Z\_\-0-9]{1,})\s{1,}([a-zA-Z\_\-0-9]{1,})\s{1,}(.*)/) 
    
    try{
      const obj = JSON.parse(arr[3])

      obj.target = arr[2] 


      if(obj.bpmSync !== undefined && obj.bpmSync){
        obj.speed = showActionMgr.bpm / 120
      }

      return obj;//action.substring(0, 7) == 'ANIMATE'
    }catch(e){
      debugger
      log("failed to parse ",action,arr,e)
      throw e
    }
  }
  matches(action: string):boolean{
    return action.substring(0, 7) == this.name
  }
  process(action: ActionHandlerAnimationParams, showActionMgr: ShowActionManager): void {
    //log("TEST","decode",action)
  }
}


export class ShowStopAllActionHandler implements ShowActionHandler{
  getName():string{return 'STOPALL'}
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return action == 'STOPALL'
  }
  execute(action: string, show: ShowActionManager){
    log('STOP ALL ')
  }
}

export class ShowBpmActionHandler implements ShowActionHandler{
  getName():string{return 'BPM'}
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return action.substring(0, 3) == 'BPM'
  }
  execute(action: string, show: ShowActionManager){
    // Change BPM
    show.bpm = parseFloat(action.substring(3))
    if (show.randomizerSystem) {
      show.randomizerSystem.reset()
    }

    log('SET BPM TO ', show.bpm)
  }
} 


export type ActionHandlerAnouncementParams={
  text:string
  duration?:number
  color?:string
}

const ANNOUNCE_ACTION_NAME = "ANNOUNCE"
export class ShowAnounceActionHandler extends ShowDynamicActionSupport<ActionHandlerAnouncementParams>{
  name=ANNOUNCE_ACTION_NAME

  matches(action: string, showActionMgr: ShowActionManager): boolean {
    log('CUSTOM matches SAY fired',action)
    return action.indexOf(ANNOUNCE_ACTION_NAME) == 0
  }
  decodeAction(action:string,showActionMgr:ShowActionManager){ 
    log("CUST decodeAction called for ",action)
    const idx = action.indexOf(ANNOUNCE_ACTION_NAME)

    const obj = JSON.parse(action.substr(idx+ANNOUNCE_ACTION_NAME.length))
    return obj;
  }
}


