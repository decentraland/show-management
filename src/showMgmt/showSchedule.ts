import { ShowDataType, ShowMatchRangeResult, ShowResultType, ShowType } from './types'
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

  getData(){
    return this.showData
  }
 
  getDefaultVideo(){
    if(this.showData){
      return this.showData.defaultShow
    }else{
      return null 
    }
  }

  async findShowToPlayByWorldTime():Promise<ShowMatchRangeResult> {
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

  findShowToPlayByDate(date:Date,startIndex?:number):ShowMatchRangeResult{
    //log("findShowToPlayByDate",date.getTime(),startIndex)
    if(startIndex < 0){
      startIndex = 0
    }
    const showMatch:ShowMatchRangeResult = {}

    this.findShowToPlayByDateInPlace(showMatch,date,startIndex)

    return showMatch;
  }

  /**
   * save memory when querying a lot by passing in an existing ShowMatchRangeResult object, will rewrite results into it
   * 
   * @param showMatch will write result into this object
   * @param date 
   * @param startIndex 
   * @returns 
   */
  findShowToPlayByDateInPlace(showMatch:ShowMatchRangeResult,date:Date,startIndex?:number):ShowMatchRangeResult{
    //log("findShowToPlayByDate",date.getTime(),startIndex)
    if(startIndex < 0){
      startIndex = 0
    }
    const unixTime = date.getTime()/1000

    let showPlaying: ShowType
    let counter = 0
    let showPlayingIndex = -1

    const sortedShows = this.shows

    //debugger
    
    let nearestShowToNow:ShowType
    let nearestShowIndex = 0
    let nearestShowToNowDiff=Number.MAX_VALUE

    //debugger
    let start = startIndex !== undefined ? startIndex : 0
    let index = 0
    //for (let show of sortedShows) {
    mainLoop:
    for( let index = start ; index < sortedShows.length; index++){
      const show = sortedShows[index]
      
      if(!show){
        log("undefined show element at " + index,show)
        continue;
      }
      
      if(show.startTime === undefined){
        log("warning undefined starttime",show)
        continue;
      }

      var showDiff = show.startTime - unixTime


      /*log("findShowToPlayByDate",showDiff,"date",date.toLocaleString()
        ,"showdate.start",new Date(show.startTime * 1000).toLocaleString()
        ,"showdate.end",new Date(show.startTime * 1000 + (show.length * 1000)).toLocaleString(),"now",new Date().toLocaleString(),show)*/

      if(show.startTime > 0 &&  Math.abs(showDiff) < Math.abs(nearestShowToNowDiff)){
        nearestShowToNow = show
        nearestShowIndex = index
        nearestShowToNowDiff = showDiff
      }

      if (    
        show.startTime > 0
        && show.startTime < unixTime 
        && show.startTime + show.length > unixTime
      ) {
        showPlaying = show
        showPlayingIndex = index
        break mainLoop;
      } 
      
    }

    //ensure cleared out before using again
    //if(showMatch.currentShow) resetShowInst(showMatch.currentShow)
    //if(showMatch.nextShow) resetShowInst(showMatch.nextShow)
    //if(showMatch.lastShow) resetShowInst(showMatch.lastShow)
    
    if(showPlaying !== undefined){
      showMatch.currentShow = inPlaceOrAssignShow(showMatch.currentShow,showPlaying,-1,showPlayingIndex)
      showMatch.currentShow.offset = unixTime - showPlaying.startTime
      
      if( showPlayingIndex - 1 > 0 ){
        showMatch.lastShow = inPlaceOrAssignShow(showMatch.lastShow,sortedShows[showPlayingIndex -1],-1,showPlayingIndex-1)
        showMatch.lastShow.offset = unixTime - showMatch.lastShow.show.startTime
      }else{
        resetShowInst(showMatch.lastShow)
      }
      if( showPlayingIndex + 1 < sortedShows.length ){
        showMatch.nextShow = inPlaceOrAssignShow(showMatch.nextShow,sortedShows[showPlayingIndex +1],-1,showPlayingIndex+1)
      }else{
        resetShowInst(showMatch.nextShow)
      }
    }else{
      resetShowInst(showMatch.currentShow)

      if(nearestShowToNow.startTime < unixTime){
        //in past
        showMatch.lastShow = inPlaceOrAssignShow(showMatch.lastShow,sortedShows[nearestShowIndex],-1,nearestShowIndex)
        showMatch.lastShow.offset = unixTime - showMatch.lastShow.show.startTime

        if( nearestShowIndex + 1 < sortedShows.length ){
          showMatch.nextShow = inPlaceOrAssignShow(showMatch.nextShow,sortedShows[nearestShowIndex +1],-1,nearestShowIndex+1)
        }else{
          resetShowInst(showMatch.nextShow)
        }
      }else{
        resetShowInst(showMatch.lastShow)
        //in future
        showMatch.nextShow = inPlaceOrAssignShow(showMatch.nextShow,nearestShowToNow,-1,nearestShowIndex)
      }
    }

    if(showMatch.nextShow && showMatch.nextShow.show){
      showMatch.nextShow.offset = showMatch.nextShow.show.startTime - unixTime
    }
    

    return showMatch;
  }
  
}

function resetShowInst(show: ShowResultType) {
  if(!show) return 

  show.show = undefined
  show.index = undefined
  show.offset = undefined
}

/**
 * attempting to avoid creating objects over and over
 * @param currentShow 
 * @param show 
 * @param offset 
 * @param index 
 * @returns 
 */
function inPlaceOrAssignShow(currentShow: ShowResultType, show: ShowType, offset: number, index: number) {
  if(!currentShow){ 
    currentShow = {show:show,offset:offset,index:index}
  }else{
    //reset it
    resetShowInst(currentShow)
  }
  currentShow.show = show
  currentShow.offset = offset
  currentShow.index = index

  return currentShow
} 

