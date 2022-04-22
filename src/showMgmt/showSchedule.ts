import { ShowDataType, ShowMatchRangeResult, ShowType } from './types'
import { fetchWorldTime } from './utils'

let PLAYING_DEFAULT: boolean = false


//export let currentlyPlaying: number | null

export class ShowSchedule{
  private showData:ShowDataType
  shows:ShowType[]
  
  //// key functions

  constructor(){
    
  }


  /**
   * will make a copy of show data and refomat it for optimization
   * shows for example will get sorted by time
   * @param showData 
   */
  setData(showData:ShowDataType){
    this.showData = showData  
    this.shows = showData.shows.sort((a, b) => (a.startTime < b.startTime) ? -1 : 1);
    //process it
  }
 
  getDefaultVideo(){
    if(this.showData){
      return this.showData.defaultShow
    }else{
      return null 
    }
  }

  async findShowToPlayByTime():Promise<ShowMatchRangeResult> {
    //log("findShowToPlayByTime")
    //if (FAKING_LOCALLY) return
  
    let showMatch:ShowMatchRangeResult = {}

    if(!this.showData){
      return showMatch
    }
    //if (playerFar) return
    try {
      //debugger  
      let worldDate = await fetchWorldTime()
      

      showMatch = this.findShowToPlayByDate(worldDate)
  
    } catch (e) {
      log('error getting shows to play ', e)
    }
    return showMatch
  }

  findShowToPlayByDate(date:Date):ShowMatchRangeResult{
    const showMatch:ShowMatchRangeResult = {}

    const unixTime = date.getTime()/1000

    let showPlaying: ShowType
    let counter = 0
    let showPlayingIndex = -1

    const sortedShows = this.shows

    //debugger
    
    let nearestShowToNow
    let nearestShowIndex = 0
    let nearestShowToNowDiff=Number.MAX_VALUE

    //debugger
    for (let show of sortedShows) {
      if (    
        show.startTime > 0
        && show.startTime < unixTime 
        && show.startTime + show.length > unixTime
      ) {
        showPlaying = show
        showPlayingIndex = counter
        break;
      } 
      
      var showDiff = show.startTime - unixTime
      if(show.startTime > 0 && showDiff < nearestShowToNowDiff){
        nearestShowToNow = show
        nearestShowIndex = counter
        nearestShowToNowDiff = showDiff
      }

      counter++
    }

    if(showPlaying !== undefined){
      showMatch.currentShow = {show:showPlaying,offset:-1}
      showMatch.currentShow.offset = unixTime - showPlaying.startTime
      
      if( showPlayingIndex - 1 > 0 ){
        showMatch.lastShow = {show:sortedShows[showPlayingIndex -1],offset:-1}
        showMatch.lastShow.offset = unixTime - showMatch.lastShow.show.startTime
      }
      if( showPlayingIndex + 1 < sortedShows.length ){
        showMatch.nextShow = {show:sortedShows[showPlayingIndex +1],offset:-1}
        
      }
    }else{
      if(nearestShowToNow.startTime < unixTime){
        //in past
        showMatch.lastShow = {show:sortedShows[nearestShowIndex],offset:-1}
        showMatch.lastShow.offset = unixTime - showMatch.lastShow.show.startTime

        if( nearestShowIndex + 1 < sortedShows.length ){
          showMatch.nextShow = {show:sortedShows[nearestShowIndex +1],offset:-1}
        }
      }else{
        //in future
        showMatch.nextShow = {show:nearestShowToNow,offset:-1}
      
      }
    }

    if(showMatch.nextShow && showMatch.nextShow.show){
      showMatch.nextShow.offset = showMatch.nextShow.show.startTime - unixTime
    }
    

    return showMatch;
  }
  
}

