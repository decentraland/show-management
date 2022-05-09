import * as ui from '@dcl/ui-scene-utils'
import { NodeCue } from '@dcl/subtitle-helper'
import { isPreviewMode } from '@decentraland/EnvironmentAPI'
import { IndexedNodeCue, SubtitleCueEvent, SubtitleSystem } from '../subtitle/SubtitleSystem'
import { ShowManager } from './manageShow'
import { RunOfShowSystem } from './runOfShowSystem'
import { hudDelay, ShowHUD } from './showhud/ShowHUD'
import { ShowDataType, ShowResultType } from './types'

const canvas = new UICanvas()

let debuggerUI_timeLapse=0
let debuggerUI_checkIntervalSeconds=.1

class ManageShowDebugUI{
  
  
  displayNameValue:string
  videoTimeValue:string
  //videoTime:UIText
  //videoStatus:UIText
  enabled:boolean = false
  checkIntervalSeconds=.1
  UI_timeLapse=0

  showHud:ShowHUD

  init(){
/*
    const videoTime = this.videoTime = new UIText(canvas)
    videoTime.visible=false
    videoTime.value = '-'
    //videoTime.positionX = 0
    //videoTime.positionY = 0
    videoTime.hAlign = 'right'
    videoTime.vAlign = 'bottom'
     
    const videoStatus = this.videoStatus = new UIText(canvas)
    videoStatus.visible=false
    videoStatus.positionX = -100
    //videoTime.positionY = 0
    videoStatus.hAlign = 'right'
    videoStatus.vAlign = 'bottom'
 */

    const hud = this.showHud = new ShowHUD()
    //log("after hud")
    hud.pendingEntityAdd = new hudDelay(hud)
    engine.addSystem(hud.pendingEntityAdd)

  }
  setVideoStatus(arg0: string) {
    this.showHud.videoStatus.value = arg0
  }
  updateVideoTimeValue(estimatedOffset: number, elapsedTime: number, subtitleSystemOffsetMs: number) {
    this.videoTimeValue = estimatedOffset.toFixed(2) +'/' + elapsedTime.toFixed(2) + '/' + (subtitleSystemOffsetMs/1000).toFixed(2)
  }
  updateDisplayNameValue(val:string){
    this.displayNameValue = val
  }
  updateUICounter(dt:number){
    this.UI_timeLapse += dt
    //manage high frequency update values
    if(this.UI_timeLapse > this.checkIntervalSeconds){
      this.UI_timeLapse = 0 

      this.showHud.playTimes.value = this.videoTimeValue
      this.showHud.displayName.value = this.displayNameValue
    }
  }
  resetCounters(){
    this.UI_timeLapse = 0
  }
  setEnabled(val:boolean){
    this.enabled = val

    this.toggleVisible(this.enabled)
  }
  toggleVisible(val:boolean){
    //this.videoTime.visible = val
    //this.videoStatus.visible = val
  }
}

//TODO create singleton
export const manageShowDebugUI = new ManageShowDebugUI()

isPreviewMode().then(preview=>{
  manageShowDebugUI.init()
  manageShowDebugUI.setEnabled(preview)
})


function playNext(showMgr: ShowManager,runOfShow:RunOfShowSystem,dir:number){
  
  if(runOfShow && runOfShow.enabled){
    ui.displayAnnouncement("Disable run of show first")
    return
  }
  let fromTime = new Date()
  if(showMgr.currentlyPlaying){
    
    fromTime =  new Date ( (showMgr.currentlyPlaying.startTime * 1000) + 1000 )
    log("findShowToPlayByDate.showMgr.currentlyPlaying",showMgr.currentlyPlaying,"fromTime",fromTime.toLocaleString())
  }
 
  const showResults = showMgr.showSchedule.findShowToPlayByDate( fromTime,-1 )
  log("showResults " , new Date().toLocaleString(),showResults,fromTime.getTime(),fromTime.toLocaleString(),showResults)
  const showToPlay = dir > 0 ? showResults.nextShow : showResults.lastShow
  //debugger
  if(showToPlay) showMgr.playVideo(showToPlay.show,0)

  manageShowDebugUI.showHud.togglePlayBtn(false)

}

export function registerWithDebugUI(showMgr: ShowManager,runOfShow: RunOfShowSystem, manageShowDebugUI: ManageShowDebugUI){

  manageShowDebugUI.showHud.onPause = ()=>{ showMgr.pause()  }
  manageShowDebugUI.showHud.onPlay = ()=>{ showMgr.play()  }
  manageShowDebugUI.showHud.onPlayNext = ()=>{  playNext(showMgr,runOfShow,1);  }
  manageShowDebugUI.showHud.onPlayPrev = ()=>{  playNext(showMgr,runOfShow,-1) ; }

  manageShowDebugUI.showHud.onRunOfShowPause = ()=>{ runOfShow.pause()  }
  manageShowDebugUI.showHud.onRunOfShowPlay = ()=>{ runOfShow.play()  }

  manageShowDebugUI.showHud.onRunOfShowRestart = ()=>{ 
    let counter = 0
    
    const padding = (5 *1000) //5 seconds
 
    //push show schedule up
    const showData = showMgr.showSchedule.getData() 
    for(const p in showData.shows){
      const show = showData.shows[p]
      if(show.startTime > 0){
        show.startTime = new Date(Date.now() + counter + padding).getTime() / 1000   

        counter+=padding + (show.length * 1000)
      }
    } 
    /*
    for(const p in showData.shows){
      const show = showData.shows[p]
      log("findShowToPlayByDate",show.artist,new Date(show.startTime * 1000).toLocaleString())
    }*/
    showMgr.showSchedule.setData(showData)
    showMgr.stopShow()
    runOfShow.reset()
    runOfShow.enabled = true

    manageShowDebugUI.showHud.toggleRunOfShowBtn(false)
  }

}
