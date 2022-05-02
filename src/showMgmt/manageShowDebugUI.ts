import { NodeCue } from '@dcl/subtitle-helper'
import { isPreviewMode } from '@decentraland/EnvironmentAPI'
import { IndexedNodeCue, SubtitleCueEvent, SubtitleSystem } from '../subtitle/SubtitleSystem'

const canvas = new UICanvas()
 
let debuggerUI_timeLapse=0
let debuggerUI_checkIntervalSeconds=.1

class ManageShowDebugUI{
  videoTimeValue:string
  videoTime:UIText
  videoStatus:UIText
  enabled:boolean = false
  checkIntervalSeconds=.1
  UI_timeLapse=0

  init(){

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
 
  }
  updateUICounter(dt:number){
    this.UI_timeLapse += dt
    //manage high frequency update values
    if(this.UI_timeLapse > this.checkIntervalSeconds){
      this.UI_timeLapse = 0 

      this.videoTime.value = this.videoTimeValue
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
    this.videoTime.visible = val
    this.videoStatus.visible = val
  }
}

export const manageShowDebugUI = new ManageShowDebugUI()
manageShowDebugUI.init()
 
isPreviewMode().then(preview=>{
  manageShowDebugUI.setEnabled(preview)
})
