export const DefaultVideoEvent: IEvents['videoEvent'] = {
  videoClipId: '',
  componentId: '',
  currentOffset: -1,
  totalVideoLength: -1,
  videoStatus: VideoStatus.NONE,
}

export declare type VideoChangeStatusCallback = (oldStatus: VideoStatus, newStatus: VideoStatus) => void;


export class VideoChangeStatusListener{
  enabled:boolean = true   
  constructor(public callback:VideoChangeStatusCallback){
    this.callback = callback  
  }
  
  update(oldStatus: VideoStatus, newStatus: VideoStatus){
    if(!this.enabled) return 
    this.callback(oldStatus,newStatus)
    OnPointerDown
  } 
}

export class VideoSystem implements ISystem {
  videoTexture: VideoTexture
  elapsedTime: number
  lastVideoEventTick: number
  lastVideoEventData: IEvents['videoEvent'] = DefaultVideoEvent
  estimatedOffset: number
  
  lastEventTime:number
  resumePlayAdjusted:boolean=true

  changeStatusListeners:VideoChangeStatusListener[] = []

  constructor(_videoTexture: VideoTexture) {
    this.videoTexture = _videoTexture
    this.elapsedTime = 0
    this.lastVideoEventTick = 0
    this.estimatedOffset = -1

    onVideoEvent.add((data) => {
      if (data.videoClipId == this.videoTexture.videoClipId) {
        this.updateEvent(data) 
      }
    }) 
  }   
  
  setOffset(offsetSeconds:number){
    //log("SEEK_CHANGEg","ADD",offsetSeconds,"to",this.estimatedOffset,"=",this.estimatedOffset+offsetSeconds)
    this.estimatedOffset = offsetSeconds
    this.onOffsetUpdate(this.estimatedOffset)  
  }

  update(dt: number) { 
    this.elapsedTime += dt 
    if (this.lastVideoEventData.videoStatus === VideoStatus.PLAYING) {
      if(this.resumePlayAdjusted == false){
        this.resumePlayAdjusted = true
        const now = Date.now()
        //log("adjustment dt " + dt,this.lastEventTime,now - this.lastEventTime)
        this.estimatedOffset += dt  - ((now - this.lastEventTime)/1000)
      }else{
        this.estimatedOffset += dt
      }
      
      this.onOffsetUpdate(this.estimatedOffset)
       //log('Playing video - currentOffset: ', this.estimatedOffset) 
    }
  }

  /**
   * Triggered when renderer send an event with status different that previous
   * @param oldStatus
   * @param newStatus
   */
  protected onChangeStatus(oldStatus: VideoStatus, newStatus: VideoStatus) { 
    
    for(let p in this.changeStatusListeners){
      this.changeStatusListeners[p].update(oldStatus,newStatus)
    }
  }

  /**
   *  Triggered every frame while the video is playing
   * @param estimatedOffset offset position in seconds. Can be -1 (invalid offset)
   */
  protected onOffsetUpdate(estimatedOffset: Number) {}

  private updateEvent(event: IEvents['videoEvent']) {
    //TRACE log('VideoEvent in VideoSystem:', event)
    if (this.lastVideoEventTick != 0.0) {  
      if (
        this.lastVideoEventData.videoStatus === undefined ||
        this.lastVideoEventData.videoStatus !== event.videoStatus
      ) {
        if (event.videoStatus === VideoStatus.PLAYING) {
          
          /*if(event.currentOffset < this.estimatedOffset){
            log("too fast adjust",event.currentOffset, this.estimatedOffset)  
          }*/
          //this.estimatedOffset = event.currentOffset
          this.setOffset(event.currentOffset)
          this.resumePlayAdjusted=false
        }  

        this.onChangeStatus(
          this.lastVideoEventData.videoStatus || VideoStatus.NONE,
          event.videoStatus as VideoStatus
        ) 
      }
    }
    //if (event.videoStatus === VideoStatus.PLAYING) {
          
      //if(event.currentOffset < this.estimatedOffset){
        //log("too fast measure drift",event.currentOffset, this.estimatedOffset,this.elapsedTime, (event.currentOffset - this.estimatedOffset))  
      //}
    //}  
    this.lastEventTime = Date.now()
    this.lastVideoEventData = event
    this.lastVideoEventTick = this.elapsedTime
  }
}
