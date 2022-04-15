import { SubtitleSystem } from "../subtitle/SubtitleSystem"
import { ShowManager } from "./manageShow"

/**
 * helper to run through all subtitles all at once to find syntax or other errors
 * @param showMgr 
 * @param str 
 */
export function runAllSubtitleCuesNowAsTest(showMgr:ShowManager, str:string){
  
  const showTester = showMgr//new ShowManager()
  //showTester.showSchedule.setData( showData )
  //showTester.register
  
  /*
  showTester.actionMgr.registeredHandler(
    new  ShowActionHandlerSupport<string>( 
      "SAY",
      {
        matches(action: string,showActionMgr:ShowActionManager):boolean{ 
          return true
        },
        process(action: ActionParams<string>, showActionMgr: ShowActionManager): boolean {
          return true
        }
      } )
  )*/

  
  const subtitle = new SubtitleSystem()
  subtitle.setSubtitlesString(str)
  
  showTester.subtitleSystem = subtitle

  const badCues=[]
  for(const p in subtitle.cueList){
    const cue = subtitle.cueList[p]
    log("running ",cue) 
    try{
      showTester.processOnCueBegin(cue)
    }catch(e){
      log("FAILED PROCESSING CUE ",cue,e)
      badCues.push(cue)
    }
  }
  if(badCues.length>0){
    log("TOTAL FAILED CUES",badCues.length,"/",subtitle.cueList.length,badCues)
  }else{
    log("ALL CUES ARE GOOD",subtitle.cueList.length,badCues)
  }
  
  
}