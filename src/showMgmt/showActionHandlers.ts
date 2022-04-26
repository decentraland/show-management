import * as utils from '@dcl/ecs-scene-utils'
import { ShowManager } from './manageShow'
import { ShowActionManager } from './manageShowActions'

@Component("dcl.show.action.handler")
export class ShowActionMember{
  enabled:boolean
}

export interface ShowActionHandler<T>{
  //name:string
  matches(action:string,showActionMgr:ShowActionManager):boolean
  execute(action:string,showActionMgr:ShowActionManager):void
  /**
   * returns the command name
   */
  getName():string

  addOnProcessListener(listener:OnProcessListener<ActionParams<T>>):void
  /**
   * returns the pattern it matches on
   */
  //pattern:()=>string
  /**
   * true means no more handlers processed
   */
  //isLast():boolean
  decodeAction(action:string,showActionMgr:ShowActionManager):ActionParams<T>
}


type ShowActionSupportArgs<T>= {
  matches?(action: string,showActionMgr:ShowActionManager):boolean,
  name?:string
  process?(action: ActionParams<T>,showActionMgr:ShowActionManager):void,
  decodeAction?(action: string,showActionMgr:ShowActionManager):ActionParams<T>
}

export type OnProcessListener<T>=(action: T,showActionMgr:ShowActionManager)=>void

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
    log("OOTB matches called for ",action)
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
  process?(action: ActionParams<T>,showActionMgr:ShowActionManager):void{  }

  decodeAction(action: string, showActionMgr: ShowActionManager):ActionParams<T>{
    const parseResult:ActionParams<T> = parseActionWithOpts(action)

    return parseResult;
  }
}


export class ShowBasicActionHandler extends ShowActionHandlerSupport<string>{
  constructor(name:string, args:ShowActionSupportArgs<string>){
    super(name, args)
  }
  matches(action: string, showActionMgr: ShowActionManager): boolean{
    return action == this.name
  }
}


export type ActionParams<T>={
  array?:string[]
  params?:T
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
    return action.substring(0, this.name.length) == this.name
  }
  process(action: ActionParams<ActionHandlerAnimationParams>, showActionMgr: ShowActionManager): void {
    //log("TEST","decode",action)
  }
}


export class ShowStopAllActionHandler extends ShowBasicActionHandler{
  public static DEFAULT_NAME = 'STOPALL'
  constructor(args:ShowActionSupportArgs<string>){
    super(ShowStopAllActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return action && action.trim() == this.name
  }
  process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
    log('STOP ALL ')
    return true
  }
}

export class ShowPauseAllActionHandler extends ShowBasicActionHandler{
  public static DEFAULT_NAME = 'PAUSEALL'
  constructor(args:ShowActionSupportArgs<string>){
    super(ShowPauseAllActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return action && action.trim() == this.name
  }
  process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
    log('PAUSEALL ALL ')
    return true
  }
}

export class ShowBpmActionHandler extends ShowActionHandlerSupport<number>{
  public static DEFAULT_NAME = 'BPM'
  constructor(args?:ShowActionSupportArgs<number>){
    super(ShowBpmActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return action.substring(0, 3) == this.name
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


export type ActionHandlerAnouncementParams={
  text:string
  duration?:number
  color?:string
}


export class ShowAnounceActionHandler extends ShowActionHandlerSupport<ActionHandlerAnouncementParams>{
  public static DEFAULT_NAME = 'ANNOUNCE'
  constructor(args:ShowActionSupportArgs<ActionHandlerAnouncementParams>){
    super(ShowAnounceActionHandler.DEFAULT_NAME,args)
  }

  matches(action: string, showActionMgr: ShowActionManager): boolean {
    log('CUSTOM matches SAY fired',action)
    return action.indexOf(this.name) == 0
  }
}

/**
 * this is not the most flexible but works decently well.  
 * It searched for the first "{" and assumes is your json argument
 * expected a pattern of: ACTION_NAME TEXT_NO_SPACES2 ... (optional JSON string to be parsed)
 *
 * @param str action to parse
 */
export function parseActionWithOpts<T>(str: string):ActionParams<T> {
  const indexOfJson = str.indexOf("{")
  const subArr = []
  
  var result:ActionParams<T>={array:[]}

  let splitIdx = str.length
  if(indexOfJson >= 0){
    splitIdx = indexOfJson
  }
  const words = str.substr(0,splitIdx)
  //this split includes the white space as part of array results, so remove it 
  result.array = words.split(/(\s+)/).filter( e => e.trim().length > 0);
  
  if(indexOfJson >= 0){
    const json = str.substr(indexOfJson)
    result.array.push(json)
    try{
      const obj = JSON.parse(json)
      result.params = obj
    }catch(e){     
      log("FAILED to parse ",str,json,e)
      throw e
    } 
  }

  return result;
}

