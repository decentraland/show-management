import { NodeCue } from '@dcl/subtitle-helper'
import { isPreviewMode } from '@decentraland/EnvironmentAPI'
import { IndexedNodeCue, SubtitleCueEvent, SubtitleSystem } from '../subtitle/SubtitleSystem'
import { DefineActionAliasActionHandler } from './actionHandlers/DefineActionAliasActionHandler'
import { DefineActionGroupActionHandler } from './actionHandlers/DefineActionGroupActionHandler'
import { DefineTargetGroupActionHandler } from './actionHandlers/DefineTargetGroupActionHandler'
import { ShowActionHandler } from './actionHandlers/showActionHandler'
import { ShowPauseAllActionHandler } from './actionHandlers/ShowPauseAllActionHandler'
/*
import {
  hideArtistName,
  hideBoard,
  setArtistName,
  startNextShowCounter,
} from './nextShowCounter'
*/
//import { videoMat } from '../videoScreens'
import { ShowActionManager } from './manageShowActions'
import { ManageShowDebugUI } from './manageShowDebugUI'
import { ShowSchedule } from './showSchedule'
import { PlayShowEvent, ShowType, StopShowEvent } from './types'
import { SubtitleVideoSystem } from './video/SubtitleVideoSystem'
import { VideoChangeStatusListener, VideoSystem } from './video/VideoSystem'

let PLAYING_DEFAULT: boolean = false

function removeItem<T>(arr: Array<T>, value: T): Array<T> { 
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export class ShowManager{
  currentlyPlaying: ShowType | null
  nextToPlay: ShowType | null
  
  actionMgr:ShowActionManager
  videoSystem: SubtitleVideoSystem
  subtitleSystem: SubtitleSystem
  //showData:ShowDataType

  showSchedule: ShowSchedule

  playVideoListeners: ((event: PlayShowEvent)=>void)[] = []
  stopShowListeners: ((event: StopShowEvent)=>void)[] = []
  changeStatusListeners:VideoChangeStatusListener[] = []

  manageShowDebugUI:ManageShowDebugUI
  
  //latestWorldTime:Date

  //// key functions

  constructor(){
    //this.manageShowDebugUI = new ManageShowDebugUI()
    this.actionMgr = new ShowActionManager()
    this.showSchedule = new ShowSchedule() 
    
  }
  
  enableDebugUI(val:boolean){
    if(!this.manageShowDebugUI){
      this.manageShowDebugUI = new ManageShowDebugUI()
      if(this.videoSystem) this.videoSystem.manageShowDebugUI = this.manageShowDebugUI
      if(this.actionMgr) this.actionMgr.manageShowDebugUI = this.manageShowDebugUI
    } 
    this.manageShowDebugUI.init()
    this.manageShowDebugUI.setEnabled(val)
    
  }
  pause(){
    this.videoSystem.pause()
    this.runAction(ShowPauseAllActionHandler.DEFAULT_NAME)
  }
  play(){
    this.videoSystem.play()

    //this.runAction(ShowPauseAllActionHandler.RESUME)
  }
  isCurrentlyPlaying(showData:ShowType){
    const retVal = this.currentlyPlaying && this.currentlyPlaying.id === showData.id
    log("currentlyPlaying",retVal,showData,this.currentlyPlaying) 
    return retVal
  }

  startShow(showData: ShowType) {
    //TODO WHAT ABOUT PLAYING BUT NEED TO SEEK FORWARD

    //this.currentlyPlaying = null
    if(!showData){ 
      //TODO figure out how this should affect state, return boolean if did it?
      log("startShow data is null, doing nothing",showData,this.currentlyPlaying)
      return
    }
    const currentlyPlaying = this.isCurrentlyPlaying(showData)
    if (currentlyPlaying){
      log("startShow.already playing ",this.currentlyPlaying)//,this.videoSystem.estimatedOffset)
      return
    } 

    this.currentlyPlaying = showData

    //FIXME ME not server synced
    let currentTime = Date.now() / 1000

    let startTime = showData.startTime
    let timeDiff = currentTime - startTime

    //of start time is negative its not a schedule play song 
    if(showData.startTime < 0){
      log("startShow.startShow was negative, dont calculate timeDiff")
      timeDiff = 0
    }

    log(
      'show started for ',
      showData.id,
      ' ',
      timeDiff,
      ' seconds ago, show playing: ',
      showData
    )
    

    log(
      'CURRENT TIME: ',
      currentTime,
      ' SHOW START: ',
      showData.startTime,
      ' DIFF: ',
      timeDiff
    )

    if (timeDiff >= showData.length * 60) {
      if(startTime < 0){//if negative start time its can be played on demand
        log('starting show anyways, ', timeDiff, ' seconds late')
        //start anyways
        this.playVideo(showData, timeDiff)
      }else{
        log('show ended')
        return
      }
    } else {
      log('starting show, ', timeDiff, ' seconds late')

      this.playVideo(showData, timeDiff)
    }
  }
  addStopShowListeners(callback:(event:StopShowEvent)=>void){
    this.stopShowListeners.push(callback)
  }
  stopShow() {
    if (this.videoSystem) {
      this.videoSystem.videoTexture.playing = false
      engine.removeSystem(this.videoSystem)
    }

    if (this.subtitleSystem) {
      this.runAction('STOPALL')
      engine.removeSystem(this.subtitleSystem)
    }

    this.currentlyPlaying = null

    PLAYING_DEFAULT = false
    //hideArtistName()

    if(this.stopShowListeners){
      const stopShowEvent = {}
      for(const p in this.stopShowListeners){
        this.stopShowListeners[p](stopShowEvent)
      }
    }
  }

  runAction(action:string){
    this.actionMgr.runAction(action)
  }

  addPlayVideoListeners(callback:(event:PlayShowEvent)=>void){
    this.playVideoListeners.push(callback)
  }

  registerListenerToSubtitle(subtitleSystem:SubtitleSystem){
    subtitleSystem.addCueListener( 
      (cue: NodeCue,event:SubtitleCueEvent) => {
        try{
          switch(event){
            case SubtitleCueEvent.CUE_BEGIN:
              this.processOnCueBegin(cue)
            break;
          }
        }catch(e){ 
          //DO not let this error bubble up, or state will be lost and all listeners wont get notified
          //it will cause them to be retried over and over.  maybe we want this at some point but not right now
          log("WARNING ManageShow processOnCueBegin listener failed. Catching so others can complete",event,cue,e)
        }
      }
    )
  }
  parseCue(cue:NodeCue):string[]{
    let actionNames = [cue.data.text]
    if (cue.data.text && cue.data.text.indexOf("\n")) {
      actionNames = cue.data.text.split("\n")
    }
    return actionNames
  }
  processOnCueBegin(cue: NodeCue) {
    let actionNames = this.parseCue(cue)
    log(`Show subtitle  '${cue.data.text}' (${actionNames.length}) at time: ${cue.data.start}`)

    //BREAK LINE AND SEND MULTIPLE
    for (const p in actionNames) {
      //log("sending ",actionNames[p])
      this.runAction(actionNames[p].trim())
    }
  }
  processExpiredCues(offsetSeconds:number){
    const offsetMS = (offsetSeconds) * 1000
    // Filter by cues with time window in 'newOffset'
    const pastCues = this.subtitleSystem.cueList.filter(
      ($) => offsetMS > $.data.end
    )
    log("processExpiredCues found these pastCues that expired",pastCues)
 
    //FIXME THIS is greedy,maybe have the handler describe itself for a more dynamic lookup
    //find handlers that define things as we need these definitions still
    const handlerNamesToProcessExpired:string[]
      = [DefineActionGroupActionHandler.DEFAULT_NAME,DefineTargetGroupActionHandler.DEFAULT_NAME,DefineActionAliasActionHandler.DEFAULT_NAME]
      const handlers:ShowActionHandler<any>[] = this.actionMgr.getRegisteredHandlers( handlerNamesToProcessExpired )

    
    //this.actionMgr.processExpiredCues( pastCues )
    
    let allActionNames:string[] = [] 
 
    for(const p in pastCues){
      const cue:IndexedNodeCue = pastCues[p]
      let actionNames = this.parseCue(cue)
      
      //TODO need to figure out how to compute backwards offsets to allow partial,offset playing???
      for (const p in actionNames) {
        allActionNames.push( actionNames[p] )
      }
    }

    this.actionMgr.processActions(allActionNames,handlers)

  }
  playVideo(showData: ShowType, offsetSeconds: number) {
    log('playVideo show ', showData)

    this.stopShow()

    if(this.manageShowDebugUI && this.manageShowDebugUI.enabled){
      this.manageShowDebugUI.updateDisplayNameValue( showData.artist )
    }
    //offsetSeconds += 5

    this.currentlyPlaying = showData

    const myVideoClip = new VideoClip(showData.link)
    const myVideoTexture = new VideoTexture(myVideoClip)
    if(showData.loop !== undefined) myVideoTexture.loop = showData.loop

    //hideBoard()

    // main video
    //videoMat.texture = myVideoTexture
 
    this.subtitleSystem = new SubtitleSystem()
    this.subtitleSystem.setSubtitlesString(showData.subs)
    this.registerListenerToSubtitle(this.subtitleSystem)
     //this.videoSystem will seek for it
    //this.subtitleSystem.setOffset(offsetSeconds * 1000)

    //prescan for errors / load define definitions
    this.processExpiredCues( offsetSeconds )

    //offsetSeconds += 5 
    let firstTimePlaying = true
    const onPlaySeek = new VideoChangeStatusListener((oldStatus: VideoStatus, newStatus: VideoStatus)=>{
       log("VideoChangeStatusListener.onPlaySeek fire",newStatus)
      switch(newStatus){ 
        case VideoStatus.PLAYING:        
          log("SEEKING!!!!",offsetSeconds,this.currentlyPlaying)    
          if(firstTimePlaying){ 
            firstTimePlaying = false
            this.videoSystem.setOffsetSeekVideo(offsetSeconds)  
          }  
           
          onPlaySeek.enabled = false
 
          this.removeVideoStatusChangeListener(onPlaySeek)
        break;
      } 

    })
    this.addVideoStatusChangeListener( onPlaySeek )

    if(this.manageShowDebugUI) this.manageShowDebugUI.resetCounters()

    this.videoSystem = new SubtitleVideoSystem(myVideoTexture,this.subtitleSystem,this.manageShowDebugUI)
    engine.addSystem(this.videoSystem)
    //do not add this.subtitleSystem to engine as videoSystem will manage it
    //engine.addSystem(this.subtitleSystem)

       
    this.videoSystem.changeStatusListeners.push( 
      new VideoChangeStatusListener((oldStatus: VideoStatus, newStatus: VideoStatus) => {
        log("VideoChangeStatusListener this.videoSystem.changeStatusListeners",this.changeStatusListeners.length)
        for(const p in this.changeStatusListeners){
          this.changeStatusListeners[p].update(oldStatus,newStatus)
        }
      }
     ))

 
       
    //FIXME does not work maybe must be playing first?  
    //myVideoTexture.seekTime(offsetSeconds)
    myVideoTexture.playing = true

     
    let artistSignAnimation = 'artist' + (showData.id + 1)

    log('ARTIST NAME', artistSignAnimation)

    this.runAction(artistSignAnimation)
    //setArtistName(showData.artist)
 
    if(this.playVideoListeners){
      const playShowEvent = {showData:showData,offsetSeconds:offsetSeconds,videoTexture:myVideoTexture}
      for(const p in this.playVideoListeners){
        this.playVideoListeners[p]( playShowEvent )
      }
    }
  }
  removeVideoStatusChangeListener(listener:VideoChangeStatusListener) {
    this.changeStatusListeners = removeItem(this.changeStatusListeners,listener)
  }
  addVideoStatusChangeListener(listener:VideoChangeStatusListener){
    this.changeStatusListeners.push(listener)
  }
  playDefaultVideo(nextShow?: ShowType[]) {
    /*if (this.currentlyPlaying && this.currentlyPlaying.id == this.showData.defaultShow.id) {
      log("already playing default video")
      return
    }*/

    //this.stopShow()

    //will play the default video
     
    this.startShow(this.showSchedule.getDefaultVideo())

    PLAYING_DEFAULT = true
    /*PLAYING_DEFAULT = true
    this.currentlyPlaying = null

    const myVideoClip = new VideoClip(this.showData.defaultShow.link)
    const myVideoTexture = new VideoTexture(myVideoClip)

    // main video
    videoMat.texture = myVideoTexture
    myVideoTexture.loop = true
    myVideoTexture.playing = true

    this.runAction('artist0')

    
    }*/
    /*
    if (nextShow) {
      startNextShowCounter(runOfShow)
    }*/
  }
}


