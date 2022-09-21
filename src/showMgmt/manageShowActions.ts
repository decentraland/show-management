import * as utils from '@dcl/ecs-scene-utils'
import { NodeCue } from '@dcl/subtitle-helper'
import { Logger, LoggerFactory } from '../logging/logging'
import { IndexedNodeCue } from '../subtitle/SubtitleSystem'
import { DefineActionAliasActionHandler } from './actionHandlers/DefineActionAliasActionHandler'
import { DefineTargetGroup, DefineTargetGroupActionHandler } from './actionHandlers/DefineTargetGroupActionHandler'
import { ShowActionHandler } from './actionHandlers/showActionHandler'
import { ShowAnimationActionHandler } from './actionHandlers/ShowAnimationActionHandler'
import { ShowAnounceActionHandler } from './actionHandlers/ShowAnounceActionHandler'
import { ShowBpmActionHandler } from './actionHandlers/ShowBpmActionHandler'
import { ShowPauseAllActionHandler } from './actionHandlers/ShowPauseAllActionHandler'
import { ShowStopAllActionHandler } from './actionHandlers/ShowStopAllActionHandler'
import { ShowManager } from './manageShow'
import { ManageShowDebugUI } from './manageShowDebugUI'

// Default beats per minute of show
export const DEFAULT_BPM = 120

/*
@Component("dcl.show.action.handler")
export class ShowActionMember{
  enabled:boolean
}*/

/*
const bpm = new ShowBpmActionHandler()
const bpmH = new ShowBpmActionHandler()
bpmH.name = ()=>{return 'BPMx'}
log("TEST")
log("TEST",bpm.name(),bpmH.name())
bpmH.name = ()=>{return 'BPMxXX'}
log("TEST",bpm.name(),bpmH.name())

const aa = new ShowAnimationActionHandler()
const AA = new ShowAnimationActionHandler()
AA.decodeAction=(action: string):ActionHandlerAnimationParams=>{ return {animationName:"bb"} }  
log("TEST",aa.execute("a",undefined),AA.execute('A',undefined))
 */
//const showActionMembers = engine.getComponentGroup(ShowActionMember)

export class FindEntityResult{
  names:string[]
  results:any[]
  missing:string[]
  //resolver:any
}

export class ShowActionManager{
  defaultBPM:number=DEFAULT_BPM
  bpm:number=DEFAULT_BPM
  randomizerSystem:RandomizerSystem
  logger:Logger

  manageShowDebugUI:ManageShowDebugUI

  registeredShowEntities:Record<string,any>={}
  registeredActionHandlerMap:Record<string,ShowActionHandler<any>>={}
  //registeredActionsList:ShowActionHandler[] = []

  //silenceHandlerErrors:boolean = false;
 
  extRunAction:(action: string)=>boolean
  overrideRunAction:(action: string)=>boolean
  

  constructor(){ 
    //default registers
    this.registerHandler(new ShowBpmActionHandler())
    this.registerHandler(new DefineTargetGroupActionHandler())
    this.registerHandler(new DefineActionAliasActionHandler())
    this.registerHandler(new ShowAnimationActionHandler())
    this.registerHandler(new ShowAnounceActionHandler())
    this.registerHandler(new ShowPauseAllActionHandler())
    this.registerHandler(new ShowStopAllActionHandler())
    
    //this.registerHandler(new RandomizerActionHandler())
    
    //this.registerHandler(new ShowBpmActionHandler())
    this.logger = LoggerFactory.getLogger("ShowActionManager")
  } 
 
  registerShowEntity(name:string,object:any){
    this.registeredShowEntities[name] = object
  }
  getShowEntityByName(name:string){
    return this.registeredShowEntities[name]
  }
  findShowEntitiesByName(name:string):FindEntityResult{
    const findEntResult = new FindEntityResult();
    const arr:any[] = []
    const missing:string[] = []

    findEntResult.results = arr

    const ent = this.getShowEntityByName(name)

    if(ent instanceof DefineTargetGroup){
      const grp = ent as DefineTargetGroup
      if(grp.targets){
        for(const p in grp.targets){
          const obj = grp.targets[p] 

          if(obj){
            arr.push(obj)
          }else{
            missing.push(obj)
          }
        }
      }
      if(grp.targetNames){
        for(const p in grp.targetNames){
          const name = grp.targetNames[p] 
          const obj = this.getShowEntityByName(name)

          if(obj){
            arr.push(obj)
          }else{
            missing.push(obj)
          }
        }
      }
    }else if(ent){
      arr.push(ent)
    }else{
      missing.push(name)
    }

    if(missing.length > 0){
      findEntResult.missing = missing
    }

    return findEntResult;
  }
  registerHandler(action:ShowActionHandler<any>){
    this.registeredActionHandlerMap[action.getName()] = action
  }
  
  getRegisteredHandlers(name:string[]):ShowActionHandler<any>[]{  
    const handlers:ShowActionHandler<any>[] = []
    for(const p in name){
      const handlerName = name[p]
      const handler = this.getRegisteredHandler( handlerName )
      if(handler){
        handlers.push(handler)
      }
    }
    return handlers
  }

  getRegisteredHandler<T extends ShowActionHandler<any>>(name:string):T{  
    return this.registeredActionHandlerMap[name] as T
  }
  
  processAction(action:string,handler:ShowActionHandler<any>){
    const METHOD_NAME = "processAction"
    if(handler && !handler.matches){
      this.logger.warn(METHOD_NAME,"does not have a matches fn ",handler.getName(),handler.matches) 
    }

    

    if(handler && handler.matches(action,this)){
      this.executeHandler(action, handler)
      return true
    }
    return false
  }
  processActions(actions:string[],handlers:ShowActionHandler<any>| ShowActionHandler<any>[]){
    for(const a in actions){
      const action = actions[a]
      if(Array.isArray(handlers)){
        for(const p in handlers){
          const handler = handlers[p]
          
          //const matched =  
          this.processAction(action,handler)  
        }
      }else{
        this.processAction(action,handlers)  
      }
    }
  }
  runAction(action: string) {
    const METHOD_NAME = "runAction"
    this.logger.trace(METHOD_NAME,"running action",action)

    //CMD {}
    const overloaded = this.overrideRunAction ? this.overrideRunAction(action) : false

    if(overloaded) return //exit now

    const matchedHandler = this.registeredActionHandlerMap[action]

    //const handlesApplied:ShowActionHandler<any>[] = []
   
    
      if(matchedHandler && matchedHandler.matches && matchedHandler.matches(action,this)){
        this.logger.debug(METHOD_NAME,"execute calling for ",action)
        //exact match
        this.processAction(action,matchedHandler)
      }else{
        //loop and try searching
        mainLoop:
        for(const p in this.registeredActionHandlerMap){
          const handler = this.registeredActionHandlerMap[p]

          const matched:boolean = this.processAction(action,handler)
          if(matched){
            //handlesApplied.push(handler)
            //if(handler.isLast()) break mainLoop
            break mainLoop
          }
        }
      }
    

    // NOTE: STOPALL, PAUSEALL and default must always exist
    switch (action) {
      case 'STOPALL':
        this.runAction('PAUSEALL')
        if (this.randomizerSystem) {
          this.randomizerSystem.active = false
        }
   
        break
      case 'PAUSEALL':
        this.logger.debug(METHOD_NAME,'PAUSEALL')

        break;
      default:
       
        break;
    }
    
    const extended = (this.extRunAction) ? this.extRunAction(action) : false

  }


  private executeHandler(action: string, handler: ShowActionHandler<any>,) {
    const METHOD_NAME = "executeHandler"
    try{ 
      this.logger.debug(METHOD_NAME,"EXECUTING HANDLER ",action,handler)  
      if(this.manageShowDebugUI) this.manageShowDebugUI.actionMgrProcessed ++
      
      handler.execute(action, this)
    }catch(e){
      if(this.manageShowDebugUI) this.manageShowDebugUI.actionMgrErrors ++
      //this.logger.error(METHOD_NAME,"FAILED EXECUTING HANDLER ",action,handler,e)  
      //this.onHandlerFailure()
      //if(!throwHandlerErrors) throw e;
      this.onHandlerFailure(action,handler,e)

      throw e  
    }
  } 

  onHandlerFailure(action: string, handler: ShowActionHandler<any>, e: any) {
    const METHOD_NAME = "onHandlerFailure"
    this.logger.error(METHOD_NAME,"ERROR FAILED EXECUTING HANDLER ",action,handler,e)  
  }
}

const RESET_ANIMATION_ON_PLAY = true
//const NO_INTERVAL_SET = undefined

//let currentAnim = 1

// const input = Input.instance

// input.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (e) => {
//   //step to next ID
//   currentAnim += 1

//   log('Playing Anim L' + (currentAnim - 1))

//   runAction('state'.concat(currentAnim.toString()))
// })

//// RANDOMIZER

export class RandomizerSystem implements ISystem {
  static _instance: RandomizerSystem | null = null

  showMgr:ShowActionManager  
  timer: number = 0
  beats: number = 8
  events: string[]
  lastPlayed: number | null = null

  active: boolean = false

  constructor(showMgr:ShowActionManager){
    this.showMgr = showMgr
  }

  update(dt: number) {
    if (!this.active) return

    this.timer += dt
    if (this.timer > (this.showMgr.bpm / 60) * this.beats) {
      this.timer = 0
      this.playRandomAction()
    }
  }
  start() {
    this.active = true
    this.timer = 0
    this.playRandomAction()
  }
  playRandomAction() {
    let randomIndex = Math.floor(Math.random() * this.events.length)
    // log('New random animation ', randomIndex, this.events[randomIndex])
    if (this.lastPlayed && this.lastPlayed == randomIndex) {
      return
    } else if (this.lastPlayed) {
      this.showMgr.runAction('PAUSEALL')
    }
    this.showMgr.runAction(this.events[randomIndex])
    this.lastPlayed = randomIndex
  }
  stop() {
    this.active = false
    if (this.lastPlayed) {
      this.showMgr.runAction('STOPALL')
    }
  }
  reset() {
    if (this.active) {
      this.timer = 0
      if (this.lastPlayed) {
        // make sure any looping animations go with the new BPM
        this.showMgr.runAction(this.events[this.lastPlayed])
      }
    }
  }
}
