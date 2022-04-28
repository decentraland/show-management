import { NodeCue } from '@dcl/subtitle-helper'
import { isPreviewMode } from '@decentraland/EnvironmentAPI'
import { IndexedNodeCue, SubtitleCueEvent, SubtitleSystem } from '../subtitle/SubtitleSystem'
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
import { DefineActionAliasActionHandler, DefineActionGroupActionHandler, DefineTargetGroupActionHandler, ShowActionHandler } from './showActionHandlers'
import { ShowSchedule } from './showSchedule'
import { PlayShowEvent, ShowType, StopShowEvent } from './types'
import { VideoSystem } from './VideoSystem'

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
  videoSystem: CustomVideoSystem
  subtitleSystem: SubtitleSystem
  //showData:ShowDataType

  showSchedule: ShowSchedule

  playVideoListeners: ((event: PlayShowEvent)=>void)[] = []
  stopShowListeners: ((event: StopShowEvent)=>void)[] = []
  changeStatusListeners:VideoChangeStatusListener[] = []
  
  //latestWorldTime:Date

  //// key functions

  constructor(){
    this.actionMgr = new ShowActionManager()
    this.showSchedule = new ShowSchedule() 
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

    offsetSeconds += 5

    this.currentlyPlaying = showData

    const myVideoClip = new VideoClip(showData.link)
    const myVideoTexture = new VideoTexture(myVideoClip)

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

    this.videoSystem = new CustomVideoSystem(myVideoTexture,this.subtitleSystem)
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

const canvas = new UICanvas()

let debuggerUI_timeLapse=0
let debuggerUI_checkIntervalSeconds=.1

const videoTime = new UIText(canvas)
videoTime.visible=false
//videoTime.positionX = 0
//videoTime.positionY = 0
videoTime.hAlign = 'right'
videoTime.vAlign = 'bottom'
 
const videoStatus = new UIText(canvas)
videoStatus.visible=false
videoStatus.positionX = -100
//videoTime.positionY = 0
videoStatus.hAlign = 'right'
videoStatus.vAlign = 'bottom'

isPreviewMode().then(preview=>{
  videoTime.visible = preview
  videoStatus.visible = preview
})

declare type VideoChangeStatusCallback = (oldStatus: VideoStatus, newStatus: VideoStatus) => void;
export class VideoChangeStatusListener{
  enabled:boolean = true   
  constructor(public callback:VideoChangeStatusCallback){
    this.callback = callback  
  }
  
  update(oldStatus: VideoStatus, newStatus: VideoStatus){
    if(!this.enabled) return 
    this.callback(oldStatus,newStatus)
    OnPointerDown
  } 
}
 
export class CustomVideoSystem extends VideoSystem {
  subtitleSystem:SubtitleSystem
  changeStatusListeners:VideoChangeStatusListener[] = []
  constructor(_videoTexture: VideoTexture,subtitleSystem?:SubtitleSystem) {
    super(_videoTexture)
    this.subtitleSystem = subtitleSystem
    debuggerUI_timeLapse=0 
  
  }
  setOffset(offsetSeconds:number){
    //log("SEEK_CHANGEg","ADD",offsetSeconds,"to",this.estimatedOffset,"=",this.estimatedOffset+offsetSeconds)
    super.setOffset(offsetSeconds) 
    //this.subtitleSystem.seekTime(0) 
    this.subtitleSystem.setOffset( this.estimatedOffset * 1000 )     
  }
  setOffsetSeekVideo(offsetSeconds:number){
    //if(offsetSeconds > 1){
      this.setOffset(offsetSeconds)
      this.videoTexture.seekTime(offsetSeconds)
      
    //}else{     
    //  log("seek time too small, ignoreing",offsetSeconds)
    //}  
  } 
  seek(offsetSeconds:number){
    //if(offsetSeconds > 1){ 
      //log("SEEK_CHANGEg","ADD",offsetSeconds,"to",this.estimatedOffset,"=",this.estimatedOffset+offsetSeconds)
      this.estimatedOffset += offsetSeconds
      this.onOffsetUpdate(this.estimatedOffset) 
      this.videoTexture.seekTime(offsetSeconds)
      this.subtitleSystem.seekTime( offsetSeconds ) 
    //}else{  
    //  log("seek time too small, ignoreing",offsetSeconds)
    //}  
  }
  //TODO consider subscription model
  onChangeStatus(oldStatus: VideoStatus, newStatus: VideoStatus) {
    if (newStatus == VideoStatus.PLAYING) {
      log(
        `VideoTexture ${this.videoTexture.videoClipId} is now playing! Offset ${this.estimatedOffset}`
      )
      if (this.subtitleSystem) {
        this.subtitleSystem.resume()
      }

      //   mySubtitleSystem.setOffset(this.estimatedOffset)
    } else {
      log(
        `VideoTexture ${this.videoTexture.videoClipId} changed status to '${newStatus}'`
      )
      if (this.subtitleSystem) {
        this.subtitleSystem.pause()
      }
    }

    videoStatus.value = videoStatusAsString(newStatus)
    for(let p in this.changeStatusListeners){
      this.changeStatusListeners[p].update(oldStatus,newStatus)
    }
  } 

  update(dt: number): void {
    super.update(dt)
    this.subtitleSystem.update(dt)
  } 
 
  onOffsetUpdate(estimatedOffset: number) {
    //log('SEEK onOffsetUpdate ', estimatedOffset) 
    
    if((estimatedOffset-debuggerUI_timeLapse) > debuggerUI_checkIntervalSeconds){
      debuggerUI_timeLapse = estimatedOffset
      
      if(videoTime.visible){
        videoTime.value = estimatedOffset.toFixed(2) +'/' + this.elapsedTime.toFixed(2) + '/' + (this.subtitleSystem.offsetMs/1000).toFixed(2) 
      }
    }
    // mySubtitleSystem.setOffset(estimatedOffset)
  } 
}

// instance systems
function videoStatusAsString(status:VideoStatus){ 
  switch(status){
    case VideoStatus.PLAYING:  return "PLAYING" //4
    case VideoStatus.LOADING:  return "LOADING" //2
    case VideoStatus.BUFFERING:  return "BUFFERING" //5
    case VideoStatus.ERROR:  return "ERROR" //1
    case VideoStatus.READY:  return "READY" //3
    case VideoStatus.NONE:  return "NONE" //0
    default: return "UNKNOWN:"+status  
  }
}