import * as utils from '@dcl/ecs-scene-utils'
import { getUserAccount } from '@decentraland/EthereumController';
import { ShowManager } from './manageShow';
import { ShowType } from './types';


export let adminList = ["0x7a3891acf4f3b810992c4c6388f2e37357d7d3ab", "0xaabe0ecfaf9e028d63cf7ea7e772cf52d662691a", "0xd210dc1dd26751503cbf1b8c9154224707820da8"]


export class RunOfShow{

  showMgr:ShowManager
  times:number[] = []
  //showsSorted:ShowType[] = []
  counter = 0
  started = false
  intermissionStarted = false
  countdownStarted = false
  lastShowIdx = 0
  //day:any

  constructor(showMgr:ShowManager){
      //this.days= days 
      this.showMgr = showMgr
      //this.showsSorted = this.showMgr.showSchedule.shows//showData.shows.sort((a, b) => (a.startTime < b.startTime) ? -1 : 1);
  }

  update(dt:number){
    

    let activeCount = 0
    //FIND NEAREST SHOW THAT HAS NOT STARTED
    //FIND SHOW THAT STARTED
    //IF NO SHOWS NOT STARTED, END
    //IF NEAREST NOT ST
    //

    let closestNotStartedShow:ShowType 
    let runningShow:ShowType

    const showsSorted = this.showMgr.showSchedule.shows
    if(showsSorted.length > 0){
      //this.day = this.days[0]
      //log(this.day)

      //for(const p in this.showMgr.showData.shows){
      for( let p = this.lastShowIdx ; p< showsSorted.length; p++){
        const showData = showsSorted[p]
        let start = showData.startTime
        let now = Math.floor(Date.now()/1000)

        if(showData.startTime < 0){
          log("invalid start time, next show",showData)
          this.lastShowIdx ++
          continue
        } 
        
        if(now >= showData.startTime + showData.length){
          log('we went past show, load another',now,(showData.startTime + showData.length),showData)
          this.lastShowIdx ++
        }else{
          if(now >= showData.startTime){
            if(runningShow === undefined){
              //log("adding starting show ",showData," vs ",runningShow)
              runningShow = showData
            }else if(runningShow.startTime - showData.startTime < 0 ){ //closer to start time
              //log("found closer starting show ",showData," vs ",runningShow)
              runningShow = showData
            }
          } else{
            if(closestNotStartedShow === undefined){
              //log("adding closer show ",showData," vs ",closestNotStartedShow)
              closestNotStartedShow = showData
            }else if(closestNotStartedShow.startTime - showData.startTime < 0 ){ //current is closer
              //log("found closer show ",showData," vs ",closestNotStartedShow)
              closestNotStartedShow = showData
            }
          }
        }
      }
    }

    if(runningShow !== undefined){
      ///this.started = true
      //this.intermissionStarted = false
      //this.countdownStarted = false

      if(this.showMgr.currentlyPlaying && runningShow.id !== this.showMgr.currentlyPlaying.id){
        log('starting show', runningShow,closestNotStartedShow)
        this.showMgr.startShow(runningShow)
      }else{
        // log('already running show', runningShow,closestNotStartedShow)
      }
    }else{
      if(closestNotStartedShow !== undefined){
        log('waiting till show start',runningShow,closestNotStartedShow)
          //this.intermissionStarted = true
          this.showMgr.playDefaultVideo()
      }

      //this.showMgr.startCountdown(closestNotStartedShow.startTime)
      
    }
    
    if(runningShow === undefined && closestNotStartedShow === undefined){
      log("no more days, stop system")
      engine.removeSystem(this)
      if(!this.intermissionStarted){
        this.intermissionStarted = true
        this.showMgr.playDefaultVideo()
      }
    }
    
  }
}