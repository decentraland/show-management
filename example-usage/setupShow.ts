

///// DEBUG  REMOVE!!!
import * as ui from '@dcl/ui-scene-utils'
import { showData } from "src/showMetadata"
import { ShowManager, VideoChangeStatusListener } from "../showMgmt/manageShow"
import { RunOfShow } from '../showMgmt/runOfShowSystem'
import { PlayShowEvent, StopShowEvent } from "../showMgmt/types"
import { ShowEntityModel } from '../syncable'
import {  ShowActionManager,  } from "../showMgmt/manageShowActions"
import {  ShowAnimationActionHandler, ShowAnounceActionHandler, ActionHandlerAnimationParams, ActionHandlerAnouncementParams, ShowStopAllActionHandler,  ShowActionHandlerSupport, ShowBasicActionHandler, ActionParams, parseActionWithOpts, ShowPauseAllActionHandler,  } from "../showMgmt/showActionHandlers"
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
  new  ShowBasicActionHandler( 
    "SAY_HI",
    {
      process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
        ui.displayAnnouncement('HI',1)
        return true 
      }
    } )
)


SHOW_MGR.actionMgr.registeredHandler(
  new  ShowActionHandlerSupport<string>( 
    "SAY",
    {
      matches(action: string,showActionMgr:ShowActionManager):boolean{ 
        return action.indexOf(this.name + " ") == 0
      },
      decodeAction(action: string, showActionMgr: ShowActionManager):ActionParams<string>{
        log("decodeAction called for ",action)  
        const decoded = parseActionWithOpts<string>(action)
        decoded.params = decoded.array[1]
        return  decoded;
      },
      process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
        ui.displayAnnouncement(action.params,1)

        return true
      }
    } )
)

SHOW_MGR.actionMgr.registeredHandler(
  new ShowAnounceActionHandler( {
    process(action: ActionParams<ActionHandlerAnouncementParams>, showActionMgr: ShowActionManager): void {
      ui.displayAnnouncement(action.params.text,action.params.duration)
    }
  } )
)

SHOW_MGR.actionMgr.registeredHandler(
  new ShowStopAllActionHandler( {
    process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
      //stop action goes here
      //some actions "stop" is a play or hide or show or stop
      return true
    }
  } )
) 

SHOW_MGR.actionMgr.registeredHandler(
  new ShowPauseAllActionHandler( {
    process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
      //pause action goes here
      //some actions "stop" is a play or hide or show or stop
      return true
    }
  } )
) 


SHOW_MGR.actionMgr.registeredHandler(
  new  ShowAnimationActionHandler( 
    {
      //name: ShowAnimationActionHandler.DEFAULT_NAME,
      process(actionResult: ActionParams<ActionHandlerAnimationParams>, showActionMgr: ShowActionManager): void {
        const action = actionResult.params
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
 



