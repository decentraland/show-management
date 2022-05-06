
import { ShowManager } from './manageShow';
import { ShowMatchRangeResult, ShowType } from './types';


export let adminList = ["0x7a3891acf4f3b810992c4c6388f2e37357d7d3ab", "0xaabe0ecfaf9e028d63cf7ea7e772cf52d662691a", "0xd210dc1dd26751503cbf1b8c9154224707820da8"]


export class RunOfShow{

  showMgr:ShowManager
  
  intermissionStarted = false
  countdownStarted = false
  lastShowIdx = 0

  timeLapse = 0
  checkIntervalSeconds = .1

  //day:any

  constructor(showMgr:ShowManager){
      //this.days= days 
      this.showMgr = showMgr
      //this.showsSorted = this.showMgr.showSchedule.shows//showData.shows.sort((a, b) => (a.startTime < b.startTime) ? -1 : 1);
  }
  reset(){
    this.lastShowIdx = 0
    this.timeLapse = 0
  }
  update(dt:number){
    
    this.timeLapse += dt
    
    if(this.timeLapse < this.checkIntervalSeconds){
      return
    }
    this.timeLapse -= this.checkIntervalSeconds

    let activeCount = 0
    //FIND NEAREST SHOW THAT HAS NOT STARTED
    //FIND SHOW THAT STARTED
    //IF NO SHOWS NOT STARTED, END
    //IF NEAREST NOT ST
    //

    const date = new Date()
    
    const showMatch = this.showMgr.showSchedule.findShowToPlayByDate( date,this.lastShowIdx )

    if(showMatch && showMatch.lastShow){
      //update index for faster checking
      this.lastShowIdx = showMatch.lastShow.index
    }

    this.processShow(showMatch)
    
  }
  processShow(showMatch:ShowMatchRangeResult){
    if(!showMatch){
      return
    }
    if(showMatch.currentShow){
      ///this.started = true
      //this.intermissionStarted = false
      //this.countdownStarted = false

      if((!this.showMgr.currentlyPlaying) || showMatch.currentShow.show.id !== this.showMgr.currentlyPlaying.id){
        log('starting show', showMatch)
        this.showMgr.startShow(showMatch.currentShow.show)
      }else{
        //log('already running show', showMatch)
      }
    }else{
      if(showMatch.nextShow){
        log('waiting till show start',showMatch)
          //this.intermissionStarted = true
          this.onNoShowToPlay(showMatch)
      }

      //this.showMgr.startCountdown(closestNotStartedShow.startTime)
      
    }
    
    if(showMatch === undefined || showMatch.currentShow === undefined && showMatch.nextShow === undefined){
      this.onOutOfShowsToPlay()
    }
  }
  onNoShowToPlay(showMatch:ShowMatchRangeResult){
    this.showMgr.playDefaultVideo()
  }

  onOutOfShowsToPlay(){
    log("no more days, stop system")
    engine.removeSystem(this)
    if(!this.intermissionStarted){
      this.intermissionStarted = true
      this.showMgr.playDefaultVideo()
    }
  }
}