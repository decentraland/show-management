## SDK Library

This project has the basics to start building your own library for using in Decentraland scenes.

The libraries in the [Awesome Repository](https://github.com/decentraland-scenes/Awesome-Repository#Libraries) are available for all to use. We encourage you to create and share your own as well, we'd love to see the community grow and start sharing more reusable solutions to common problems through libraries!

## Publish

See [Create Libraries](https://docs.decentraland.org/development-guide/create-libraries/) for tips on how to design and develop your library, and for simple instructions for publishing it to NPM.

Below is a template to help you craft documentation for your library, so others know how to use it.

# MyAmazingLibrary Documentation

myAmazingLibrary includes helpful solutions for `< insert use case >` in a Decentraland scene.

## Install

To use any of the helpers provided by this library:

1. Install it as an npm package. Run this command in your scene's project folder:

   ```
   npm install myAmazingLibrary
   ```

2. Add this line at the start of your game.ts file, or any other TypeScript files that require it:

   ```ts
   import * as magic from 'myAmazingLibrary'
   ```

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

### Show the current video in my scene 

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



## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.
