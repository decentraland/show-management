import * as utils from '@dcl/ecs-scene-utils'
import { ShowManager } from './manageShow'
import { ShowActionHandler, ShowBpmActionHandler } from './showActionHandlers'

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

export class ShowActionManager{
  defaultBPM:number=DEFAULT_BPM
  bpm:number=DEFAULT_BPM
  randomizerSystem:RandomizerSystem
  
  registeredShowEntities:Record<string,any>={}
  registeredActionsMap:Record<string,ShowActionHandler>={}
  //registeredActionsList:ShowActionHandler[] = []
 
  extRunAction:(action: string)=>boolean
  overrideRunAction:(action: string)=>boolean

  constructor(){ 
    //default registers
    this.registeredHandler(new ShowBpmActionHandler())
  } 
 
  registerShowEntity(name:string,object:any){
    this.registeredShowEntities[name] = object
  }
  getShowEntityByName(name:string){
    return this.registeredShowEntities[name]
  }
  registeredHandler(action:ShowActionHandler){
    this.registeredActionsMap[action.getName()] = action
  }

  runAction(action: string) {
    log("running action",action)

    //CMD {}
    const overloaded = this.overrideRunAction ? this.overrideRunAction(action) : false

    if(overloaded) return //exit now

    const matchedAction = this.registeredActionsMap[action]

    const handlesApplied:ShowActionHandler[] = []
   
    if(matchedAction && matchedAction.matches(action,this)){
      //exact match
      log("execute calling for ",action)
      matchedAction.execute(action,this)
      handlesApplied.push(matchedAction)
    }else{
      //loop and try searching
      mainLoop:
      for(const p in this.registeredActionsMap){
        const handler = this.registeredActionsMap[p]

        if(handler && !handler.matches){
          log("does not have matches ",matchedAction.matches) 
        }

        if(handler && handler.matches(action,this)){
          log("execute calling for ",action)
          handler.execute(action,this)

          handlesApplied.push(handler)
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
        log('PAUSEALL')

        break;
      default:
       
        break;
    }
    
    const extended = (this.extRunAction) ? this.extRunAction(action) : false

  }

}

const RESET_ANIMATION_ON_PLAY = true
const NO_INTERVAL_SET = undefined

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
