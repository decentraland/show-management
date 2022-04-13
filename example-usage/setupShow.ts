

///// DEBUG  REMOVE!!!
import * as ui from '@dcl/ui-scene-utils'
import { showData } from "src/showMetadata"
import { ShowManager, VideoChangeStatusListener } from "../showMgmt/manageShow"
import { RunOfShow } from '../showMgmt/runOfShowSystem'
import { PlayShowEvent, StopShowEvent } from "../showMgmt/types"
import { ShowEntityModel } from '../syncable'
import {  ShowActionManager,  } from "../showMgmt/manageShowActions"
import {  ShowAnimationActionHandler, ShowAnounceActionHandler, ShowStringActionHandler,ActionHandlerAnimationParams, ActionHandlerAnouncementParams,  } from "../showMgmt/showActionHandlers"
import { videoMat } from "../videoScreens"
import { hideArtistName, hideBoard, setArtistName } from "./nextShowCounter"
  

export const STAGE_ID = 1


export const SHOW_MGR = new ShowManager()
SHOW_MGR.showSchedule.setData( showData )
//startShow(shows['test'])


SHOW_MGR.addStopShowListeners( (event:StopShowEvent)=>{
  log("addStopShowListeners fired",event)
  if (videoMat.texture) { 
    let currentVideoTexuture = videoMat.texture as VideoTexture
    currentVideoTexuture.playing = false
  }
  hideArtistName()   
} )

 
SHOW_MGR.addPlayVideoListeners( (event:PlayShowEvent)=>{
  log("addPlayVideoListeners fired",event)
  
  hideBoard()
 
  // main video
  if(event.videoTexture) videoMat.texture = event.videoTexture

  setArtistName(event.showData.artist)
} )

SHOW_MGR.addVideoStatusChangeListener( new VideoChangeStatusListener((oldStatus: VideoStatus, newStatus: VideoStatus)=>{
  log("addVideoStatuChangeListener fired",oldStatus,newStatus)
  
  //videoTime.value = newStatus.toString()

  switch(newStatus){
    case VideoStatus.LOADING:

    break;
  }

} ))

SHOW_MGR.actionMgr.registeredHandler(
  new  ShowStringActionHandler( {
    name:"SAY_HI", 
    matches: (action: string, showActionMgr: ShowActionManager): boolean => {
      return action == "SAY_HI"
    },
    process(action: string, showActionMgr: ShowActionManager): boolean {
      ui.displayAnnouncement('HI',1)

      return true
    }
  } )
)

const ANNOUNCE_ACTION_NAME = "ANNOUNCE"
SHOW_MGR.actionMgr.registeredHandler(
  new ShowAnounceActionHandler( {
    name:ANNOUNCE_ACTION_NAME,
    process(action: ActionHandlerAnouncementParams, showActionMgr: ShowActionManager): void {
      ui.displayAnnouncement(action.text,action.duration)
    }
  } )
)

SHOW_MGR.actionMgr.registeredHandler(
  new  ShowAnimationActionHandler( {
    name: ShowAnimationActionHandler.DEFAULT_NAME,
    process(action: ActionHandlerAnimationParams, showActionMgr: ShowActionManager): void {
      const target = showActionMgr.getShowEntityByName(action.target)
       
      if(!target){
        log("WARNING could not find target",action)
        return
      } 
      log("animate",action)
      const showEntity = target as ShowEntityModel

      const noLoop = (action.loop !== undefined && action.loop==false)

      if(action.play === undefined || action.play){
        showEntity.playAnimation(  
          action.animationName,
          noLoop, 
          action.duration,
          action.speed,
          action.interval,
          (action.resetAnimation === undefined || action.resetAnimation),
          action.layer 
        )
      }else{
        log("calling stop!!")
        showEntity.stop()
      }
    }
  } )
)



//SHOW_MGR.ru

SHOW_MGR.actionMgr.extRunAction = (action:string)=>{

  let applied = false
  switch(action){
    case 'OLD_WAY':
      log("OLD_WAY fired")  
      applied = true
    break;
  }
  return applied
}


const runOfShow = new RunOfShow(SHOW_MGR)
engine.addSystem(runOfShow)
 



