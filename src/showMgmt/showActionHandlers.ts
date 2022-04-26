import * as utils from '@dcl/ecs-scene-utils'
import { ShowManager } from './manageShow'
import { ShowActionManager } from './manageShowActions'
import { actionStartsWith } from './utils'

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
    return actionStartsWith(action,this.getName(),0," ")
  }
}


export class ShowStopAllActionHandler extends ShowBasicActionHandler{
  public static DEFAULT_NAME = 'STOPALL'
  constructor(args:ShowActionSupportArgs<string>){
    super(ShowStopAllActionHandler.DEFAULT_NAME,args)
  }
  //isLast(action: string):boolean{ return false }
  matches(action: string):boolean{
    return actionStartsWith(action,this.getName(),0," ")
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
    return actionStartsWith(action,this.getName(),0," ")
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


export type DefineActionAlias={
  action:string
}
export type DefineTargetGroupType={
  targets?:any[]
  targetNames?:string[]
}
export type DefineActionParams<T>={
  type:string
  name:string
  opts?:T
}

export class DefineTargetGroup{
  targetNames:string[]
  targets:any[]
  constructor(args:DefineTargetGroupType){
    this.targetNames = args.targetNames
    this.targets = args.targets
  }
}

//DEFINE TARGET_GROUP GRP_NAME []
//example
//DEFINE TARGET_GROUP top_lights light1,light2,light3

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
    
    return result 
  }
  process(action: ActionParams<DefineActionParams<DefineTargetGroupType>>, showActionMgr: ShowActionManager): boolean {
    //showActionMgr.en
    //action.params.opts.targets
    showActionMgr.registerShowEntity(action.params.name,new DefineTargetGroup(action.params.opts))
    
    return true
  }
}


//DEFINE ACTION CUST_ACTION ACTION.....
//example
//DEFINE ACTION DEF_SAY_HI SAY "hi"
export class DefineActionAliasActionHandler extends ShowActionHandlerSupport<DefineActionParams<DefineActionAlias>>{
  public static DEFAULT_NAME = 'DEFINE ACTION'
  constructor(args?:ShowActionSupportArgs<DefineActionParams<DefineActionAlias>>){
    super(DefineActionAliasActionHandler.DEFAULT_NAME,args)
  }

  matches(action: string, showActionMgr: ShowActionManager): boolean {
    //log('CUSTOM matches SAY fired',action)
    return actionStartsWith(action,this.name,0," ")
  }
  decodeAction(action: string, showActionMgr: ShowActionManager): ActionParams<DefineActionParams<DefineActionAlias>> {
    var result:ActionParams<DefineActionParams<DefineActionAlias>>={array:[]}
    const arr = splitByWhiteSpace(action)

    result.array = arr

    const optArr = arr.length > 3 ? arr.splice(3).join(" ") : undefined

    //convert to type
    result.params = { type: arr[1],name:arr[2], opts: {action: optArr} }
    
    return result
  }
  process(action: ActionParams<DefineActionParams<DefineActionAlias>>, showActionMgr: ShowActionManager): boolean {
    //register the alias as a new action handler ... very meta
 
    const mainProcessActionArg = action
    
    //const handler = new ...
    showActionMgr.registerHandler( 
      new ShowBasicActionHandler( mainProcessActionArg.params.name,
        {
          process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
            log("DefineActionAliasActionHandler handling action",action)
            //debugger
            showActionMgr.runAction( mainProcessActionArg.params.opts.action )
            return true
          }
        } )
     )
    
    return true
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
    //log('CUSTOM matches SAY fired',action)
    return actionStartsWith(action,this.name,0," ")
  }
}


 export function splitByWhiteSpace(str: string):string[] {
  //this split includes the white space as part of array results, so remove it 
  return str.split(/(\s+)/).filter( e => e.trim().length > 0);
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
  result.array = splitByWhiteSpace(words)
  
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

