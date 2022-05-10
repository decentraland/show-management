## Show Manager

Provides helpers to schedule shows and sychronize actions with shows


# Show Manager Documentation


- [Show Manager](#show-manager) 
- [Configure Shows](#configure-shows) 
- [Run Your Show](#run-your-show) 
- [Event Listeners](#event-listeners) 
- [Display the Show Video](#Display-the-Show-Video)
- [Perform a specific action for a certian show](#Perform-a-specific-action-for-a-certian-show)
- [Enable Debug UI](#Enable-Debug-UI)
- [Adjust Logging Levels](#Adjust-Logging-Levels)


## Install

To use any of the helpers provided by this library:

1. Install it as an npm package. Run this command in your scene's project folder:

   ```
   npm i @dcl/show-management
   ```

2. Add this line at the start of your game.ts file, or any other TypeScript files that require it:

   ```ts
   import * as showMgmt from '@dcl/show-management'
   ```

> To be recognized you may also have to add an entry in tsconfig.json
> ```
> sdfs
> ```

## Usage


### Show Manager 

You will need need to create a ShowManager instance to start and assign it a schedule

```ts
import * as showMgmt from 'show-mgmt-dcl'

const showData: showMgmt.ShowDataType = ...

export const SHOW_MGR = new showMgmt.ShowManager()

SHOW_MGR.showSchedule.setData( showData )

```

### Configure Shows

You must create showData that will define what shows to play and when. 

####

```ts
const defaultShow:ShowType = {
  id: -1, //
  title: "Intermission",//the title of the show
  artist: "Artist Name", //name of the artist
  link: DEFAULT_VIDEO, //link to the video, can be internal or external
  subs: IntermissionSubs, //string to a subtitle SRT format
  startTime: -1, //UTC time in seconds for which a show will start
  length: 17, //length of video in seconds
  loop: true //if the video should loop when over
}

const showData: ShowDataType = {
  defaultShow: defaultShow,
  shows: [
		{
		  id: -1, //
		  title: "Title",//the title of the show
		  artist: "Artist Name", //name of the artist
		  link: `videos/tunnelVisuals.mp4`, //link to the video, can be internal or external
		  subs: MySubTitleVar, //string to a subtitle SRT format
		  startTime: 1652117754, //UTC time in seconds for which a show will start
		  length: 17, //length of video in seconds
		  loop: false //if the video should loop when over
		}
	]
```

NOTE:  You maybe tempted to use ISO 8601 date format however there is no garetee 100% support it will be parsed correctly.  ISO 8601 format is the most universally supported however you cannot rely on correct implementation of the standard.  https://en.wikipedia.org/wiki/ISO_8601

```
new Date("2022-05-09T16:39:00-04:00").getTime()/1000 //use at your own risk
```

Here is one of many free helpful converter tools [https://www.epochconverter.com/](https://www.epochconverter.com/) to you convert to date and time to seconds for startTime


#### Configure Show Example

```ts
import * as showMgmt from 'show-mgmt-dcl'

//while testing this can ensure the video start time is always 5 seconds after scene load
const testStartTime = new Date(Date.now() + (5 *1000)).getTime() / 1000   

const showData: showMgmt.ShowDataType = {
  defaultShow: defaultShow,
  shows: [
		defaultShow,
		{ 
	    id: 1,
	    title: 'Demo Show',
	    artist: 'Demo Show',
	    link: `videos/tunnelVisuals.mp4`,
	    subs: DemoShowSubs,
	    startTime: testStartTime, //start time from UTC in seconds
	    length: 28,
	  }
	]
}
```



### Run Your Show


You will need need to create a RunOfShowSystem instance should you want the show to play by it self when the startTime dictage

```ts
import * as showMgmt from 'show-mgmt-dcl'

export const runOfShow = new showMgmt.RunOfShowSystem(SHOW_MGR)
engine.addSystem(runOfShow)

```


### Event Listeners

The Show Manager has no knowlege of your scene and how it should react to the videos.  So your scene react to show events registering to the provided event listeners

* addStopShowListeners
* addPlayVideoListeners
* addVideoStatusChangeListener

```ts
import * as showMgmt from 'show-mgmt-dcl'

SHOW_MGR.addStopShowListeners( (event:showMgmt.StopShowEvent)=>{
  log("addStopShowListeners fired",event)
  
  ...  
} )

 
SHOW_MGR.addPlayVideoListeners( (event:showMgmt.PlayShowEvent)=>{
  log("addPlayVideoListeners fired",event)
  
  ...
} )

SHOW_MGR.addVideoStatusChangeListener( new showMgmt.VideoChangeStatusListener((oldStatus: VideoStatus, newStatus: VideoStatus)=>{
  log("addVideoStatuChangeListener fired",oldStatus,newStatus)
  
  switch(newStatus){
    case VideoStatus.LOADING:

    break;
    ...
  }

} ))

```

### Display the Show Video


The Show Manager will create a video texture but does not know where to put it in your scene.  You can register to SHOW_MGR.addPlayVideoListeners and assign the video texture where it needs to go.

```ts

export const videoMat = new Material()

//create video material
videoMat.castShadows = false
videoMat.metallic = 0
videoMat.roughness = 1
videoMat.emissiveIntensity = 1
videoMat.emissiveColor = Color3.White()
videoMat.alphaTest = 1

//create entity
export const myScreenEntity = new Entity()
const myScreenPlane = new PlaneShape()
myScreenEntity.addComponent(myScreenPlane)

//add material
myScreenEntity.addComponent(videoMat)

//add to engine
engine.addEntity(myScreenEntity)

SHOW_MGR.addPlayVideoListeners( (event:showMgmt.PlayShowEvent)=>{
  log("addPlayVideoListeners fired",event)
  
  //assign the playing video to a material so it can be visible in scene
  if(event.videoTexture){ 
    videoMat.albedoTexture = event.videoTexture
    videoMat.alphaTexture  = event.videoTexture
    videoMat.emissiveTexture = event.videoTexture
  }
} )
```

### Perform a specific action for a certian show

In this example I want to show a countdown to when the next show will be.  Register a listener to  addPlayVideoListeners and perform your logic there

```ts
SHOW_MGR.addPlayVideoListeners( (event:showMgmt.PlayShowEvent)=>{
  log("addPlayVideoListeners fired",event)

  //if I know the intermission show ID I can check for it and perform a very specific action
  if(event.showData.id == -1){ 
    const showRange = SHOW_MGR.showSchedule.findShowToPlayByDate( new Date() ) 
    if(showRange.nextShow && showRange.nextShow.show){   
	    startNextShowCounter(showRange.nextShow)
    } 
  }else{
  	hideShowCounter()
  }
 
} )

```


### Enable Debug UI

```ts
 
isPreviewMode().then(preview=>{
  if(preview) {
    SHOW_MGR.enableDebugUI(preview)
    registerWithDebugUI( SHOW_MGR.manageShowDebugUI,SHOW_MGR, runOfShow  ) 
  }
})

```

### Adjust Logging Levels

To avoid flooding logs each class has its own logger named by class name.  You can adjust logging levels for all classes or just a few to suit your needs

Classes of interest

* ShowManager - manager class that is called to play shows
* RunOfShowSystem - system that processes showSchedule and decides which show to play at the correct time
* SubtitleVideoSystem - system that processes video events
* SubtitleSystem - system that handles processing subtitles
* ShowActionManager - processes an actions to be sent to a handler
* ShowActionHandler - the action handlers them self


```ts
//create a named logger
const logger:showMgmt.Logger = showMgmt.LoggerFactory.getLogger("MyScene.ShowSetup.ts")

//set logger for a specific logger
logger.setLevel(showMgmt.LogLevel.DEBUG)

//will set default logging level for all loggers
showMgmt.LoggingConfiguration.getInstance().defaultLevel = showMgmt.LogLevel.DEBUG

//set logger for a specific action handler logger
const logHandlerAnimation = showMgmt.LoggerFactory.getLogger("ShowActionHandler."+showMgmt.ShowAnimationActionHandler.DEFAULT_NAME)
if(logHandlerAnimation) logHandlerAnimation.setLevel(showMgmt.LogLevel.TRACE)


```

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.
