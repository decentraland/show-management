

import { Logger, LoggerFactory } from "../../logging/logging";
import { SubtitleSystem } from "../../subtitle/SubtitleSystem";
import { ManageShowDebugUI } from "../manageShowDebugUI";
import { VideoSystem } from "./VideoSystem";


 
export class SubtitleVideoSystem extends VideoSystem {
  subtitleSystem:SubtitleSystem
  manageShowDebugUI: ManageShowDebugUI
  logger:Logger

  constructor(_videoTexture: VideoTexture,subtitleSystem?:SubtitleSystem,manageShowDebugUI?:ManageShowDebugUI) {
    super(_videoTexture)
    this.subtitleSystem = subtitleSystem
    this.manageShowDebugUI = manageShowDebugUI
    this.logger = LoggerFactory.getLogger("SubtitleVideoSystem")
  }
  pause(){
    //no need to pause subtitle, event listener for video state change will trigger pause
    this.videoTexture.pause()
  }
  play(){
    //no need to pause subtitle, event listener for video state change will trigger play
    this.videoTexture.play()
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
    const METHOD_NAME="onChangeStatus"
    if (newStatus == VideoStatus.PLAYING) {
      this.logger.debug(METHOD_NAME,
        `VideoTexture ${this.videoTexture.videoClipId} is now playing! Offset ${this.estimatedOffset}`
      )
      if (this.subtitleSystem) {
        this.subtitleSystem.resume()
      }

      //   mySubtitleSystem.setOffset(this.estimatedOffset)
    } else {
      this.logger.debug(METHOD_NAME,
        `VideoTexture ${this.videoTexture.videoClipId} changed status to '${newStatus}'`
      )
      if (this.subtitleSystem) {
        this.subtitleSystem.pause()
      }
    }

    if(this.manageShowDebugUI && this.manageShowDebugUI.enabled) this.manageShowDebugUI.setVideoStatus( videoStatusAsString(newStatus) )
    
    super.onChangeStatus(oldStatus,newStatus)
  } 

  update(dt: number): void {
    super.update(dt)
    this.subtitleSystem.update(dt)

    if(this.manageShowDebugUI && this.manageShowDebugUI.enabled){
      this.manageShowDebugUI.updateUICounter(dt)
    }
  } 
 
  onOffsetUpdate(estimatedOffset: number) {
    //log('SEEK onOffsetUpdate ', estimatedOffset) 
    if(this.manageShowDebugUI && this.manageShowDebugUI.enabled){
      this.manageShowDebugUI.updateVideoTimeValue( estimatedOffset , this.elapsedTime , this.subtitleSystem.offsetMs )
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