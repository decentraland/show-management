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
  
    const showMatch:ShowMatchRangeResult = {}

    if(!this.showData){
      return showMatch
    }
    //if (playerFar) return
    try {
      //debugger  
      let worldDate = await fetchWorldTime()
      const unixTime = worldDate.getTime()/1000

      let showPlaying: ShowType
      let counter = 0
      let showPlayingIndex = -1

      const sortedShows = this.shows

      
      for (let show of sortedShows) {
         
        if (
          show.startTime < unixTime 
          && show.startTime + show.length > unixTime
        ) {
          showPlaying = show
          showPlayingIndex = counter
          break;
        }
        counter++
      }

      if(showPlaying !== undefined){
        showMatch.currentShow = {show:showPlaying,offset:-1}
        showMatch.currentShow.offset = unixTime - showPlaying.startTime
      }
      if( showPlayingIndex - 1 > 0 ){
        showMatch.lastShow = {show:sortedShows[showPlayingIndex -1],offset:-1}
        showMatch.lastShow.offset = unixTime - showMatch.lastShow.show.startTime
      }
      if( showPlayingIndex + 1 < sortedShows.length ){
        showMatch.nextShow = {show:sortedShows[showPlayingIndex +1],offset:-1}
        showMatch.nextShow.offset = unixTime - showMatch.nextShow.show.startTime
      }
  
    } catch (e) {
      log('error getting shows to play ', e)
    }
    return showMatch
  }
  
}

