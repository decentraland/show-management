/////////////////////////////////
// BuilderHUD
// (c) 2019 Carl Fravel
// See the Readme for instructions
// Notes: 
// Has the concept of a default par6ent, initially null, but updated by the constructor or any attachToEntity params
// If a new entity is added, it uses the default entity as its parent,
// i.e. the parent specified in the constructor or most recent attachToEnityt call.

import { isPreviewMode } from "@decentraland/EnvironmentAPI"



export class ShowHUD {
    isSetup: boolean = false
    
    defaultParent:any
    canvas:any
    uiMinimizedContainer: any
    uiMaximizedContainer: any
    uiMaximized:boolean = false

    pendingEntityAdd:any
    maximizeButton:any

    prevBtn:UIImage
    nextBtn:UIImage
    pauseBtn:UIImage
    playBtn:UIImage

    runOfShowPauseBtn:UIImage
    runOfShowPlayBtn:UIImage
    restartRunOfShow:UIImage

    displayName:any
    videoStatus:UIText
    playTimes:UIText

    onRunOfShowRestart:()=>void
    onPause:()=>void
    onPlay:()=>void
    onPlayNext:()=>void
    onPlayPrev:()=>void
    onRunOfShowPlay:()=>void
    onRunOfShowPause:()=>void

    minimizeButton:any
    
    unsavedContainer: UIContainerRect

    constructor () {

        this.unsavedContainer = new UIContainerRect(this.canvas)
        this.unsavedContainer.hAlign = 'right'
        this.unsavedContainer.vAlign = 'bottom'
        this.unsavedContainer.width = 160
        this.unsavedContainer.height = 20
        this.unsavedContainer.positionY = 530

        this.unsavedContainer.positionX = 0
        this.unsavedContainer.color = Color4.Red()
        this.unsavedContainer.visible = false

        var changes = new UIText(this.unsavedContainer)
        changes.hAlign = 'center'
        changes.vAlign = 'center'
        changes.positionY = 0
        changes.positionX = 0
        changes.height = 10
        changes.fontSize = 12
        changes.hTextAlign = "center"
        changes.value = "** Unsaved Changes **"

        //engine.addSystem(this.rotator)
        this.setupUI()

        const hud = this

        executeTask(async ()=>{
            if(await isPreviewMode()){
                log("in preview mode")
                hud.uiMinimizedContainer.visible = true
            }
            else{
                log("not in preview mode")
              hud.uiMinimizedContainer.visible =false
              hud.uiMaximizedContainer.visible = false
              //engine.removeEntity(this.selectionPointer)
            }
        })
        //engine.addSystem(new MoveSystem(this.scaffolding, this.axis))
        //this.movingSystem = new MoveSystem(this.scaffolding, this.axis)
        //engine.addSystem(this.movingSystem)
    }

    setDefaultParent(defaultParent:Entity) {
        this.defaultParent = defaultParent
    }
    togglePlayBtn(val:boolean){
        this.playBtn.visible = val
        this.pauseBtn.visible = !val
    }
    toggleRunOfShowBtn(val:boolean){
        this.runOfShowPlayBtn.visible = val
        this.runOfShowPauseBtn.visible = !val
    }
    
    async setupUI (){
        const host = this

        this.isSetup = true
        // load the image atlas
        let imageAtlas = "https://github.com/wacaine/show-mgmt-dcl/blob/master/images/builderhud.png" //"src/showMgmt/showhud/builderhud.png"
        let imageTexture = new Texture(imageAtlas)

        // Create canvas component
        this.canvas = new UICanvas()
        this.canvas.hAlign = 'center'
        this.canvas.vAlign = 'bottom'
        //this.canvas.positionY = 100
        //this.canvas.positionX = 10
        
        //////////////////////// 
        // Minimized UI
        // Container
        this.uiMinimizedContainer = new UIContainerRect(this.canvas)
        this.uiMinimizedContainer.hAlign = 'right'
        this.uiMinimizedContainer.vAlign = 'bottom'
        //this.uiMinimizedContainer.adaptHeight = true
        //this.uiMinimizedContainer.adaptWidth = true
        this.uiMinimizedContainer.width = 70
        this.uiMinimizedContainer.height = 80
        this.uiMinimizedContainer.positionY = 50
        this.uiMinimizedContainer.positionX = 0
        this.uiMinimizedContainer.color = new Color4(0, 0, 0, 0)
        //this.uiMinimizedContainer.stackOrientation = UIStackOrientation.VERTICAL
        this.uiMinimizedContainer.visible = false

        // Expand button
        this.maximizeButton = new UIImage(this.uiMinimizedContainer, imageTexture)
        this.maximizeButton.sourceLeft = 826
        this.maximizeButton.sourceTop = 544
        this.maximizeButton.sourceWidth = 74
        this.maximizeButton.sourceHeight = 74
        //this.maximizeButton.hAlign = 'left'
        //this.maximizeButton.vAlign = 'top'
        //this.maximizeButton.positionX = 5
        //this.maximizeButton.positionY = -5
        this.maximizeButton.hAlign = 'right'
        this.maximizeButton.vAlign = 'bottom'
        this.maximizeButton.positionX = -15
        this.maximizeButton.positionY = 30
        this.maximizeButton.width=40
        this.maximizeButton.height=40
        this.maximizeButton.isPointerBlocker = true
        this.maximizeButton.onClick = new OnClick(() => {
            this.maximizeUI()
        })

        //////////////////////// 
        // Maximized UI
        ///////////////////////

        // Container       
        this.uiMaximizedContainer = new UIContainerRect(this.canvas)
        this.uiMaximizedContainer.hAlign = 'right'
        this.uiMaximizedContainer.vAlign = 'bottom'
        //this.uiMaximizedContainer.adaptWidth = true
        //this.uiMaximizedContainer.adaptHeight = true
        this.uiMaximizedContainer.width = 160
        this.uiMaximizedContainer.height = 200//430
        this.uiMaximizedContainer.positionX = 0
        this.uiMaximizedContainer.positionY = 50
        this.uiMaximizedContainer.color = new Color4(0, 0, 0, 0.75)
        //this.uiMaximizedContainer.stackOrientation = UIStackOrientation.VERTICAL

        
        var nextBtn = new UIImage(this.uiMaximizedContainer, imageTexture)
        nextBtn.sourceLeft = 97
        nextBtn.sourceTop = 184
        nextBtn.sourceWidth = 74
        nextBtn.sourceHeight = 74
        nextBtn.hAlign = 'right'
        nextBtn.vAlign = 'top'
        nextBtn.positionX = -15
        nextBtn.positionY = -10
        nextBtn.width=40
        nextBtn.height=40
        nextBtn.isPointerBlocker = true
        
        nextBtn.onClick = new OnClick(() => {
            //this.toggleLift.sourceLeft = 503
            //this.axis.getComponent(Transform).position.y = 1
            log("clicked")
            engine.addSystem(new ClickAnimationSystem(nextBtn))

            if(this.onPlayNext) this.onPlayNext()
        })

        var pauseBtn = this.pauseBtn = new UIImage(this.uiMaximizedContainer, imageTexture)
        pauseBtn.sourceLeft = 178
        pauseBtn.sourceTop = 454
        pauseBtn.sourceWidth = 74
        pauseBtn.sourceHeight = 74
        pauseBtn.hAlign = 'right'
        pauseBtn.vAlign = 'top'
        pauseBtn.positionX = -60
        pauseBtn.positionY = -10
        pauseBtn.width=40
        pauseBtn.height=40
        pauseBtn.isPointerBlocker = true

        pauseBtn.onClick = new OnClick(() => {
            //this.toggleLift.sourceLeft = 503
            //this.axis.getComponent(Transform).position.y = 1
            log("clicked")
            
            host.togglePlayBtn(true)
            engine.addSystem(new ClickAnimationSystem(host.playBtn))
            //engine.addSystem(new ClickAnimationSystem(pauseBtn))

            if(this.onPause) this.onPause()
        })

        const playBtn = this.playBtn = new UIImage(this.uiMaximizedContainer, imageTexture)
        playBtn.sourceLeft = 97
        playBtn.sourceTop = 274
        playBtn.sourceWidth = 74
        playBtn.sourceHeight = 74
        playBtn.hAlign = 'right'
        playBtn.vAlign = 'top'
        playBtn.positionX = -60
        playBtn.positionY = -10
        playBtn.width=40
        playBtn.height=40
        playBtn.isPointerBlocker = true
        playBtn.visible = false

        playBtn.onClick = new OnClick(() => {
            //this.toggleLift.sourceLeft = 503
            //this.axis.getComponent(Transform).position.y = 1
            log("clicked PLAY")
            
            host.togglePlayBtn(false)

            engine.addSystem(new ClickAnimationSystem(host.pauseBtn))

            if(this.onPlay) this.onPlay()
        })

        const prevBtn = this.prevBtn = new UIImage(this.uiMaximizedContainer, imageTexture)
        prevBtn.sourceLeft = 16
        prevBtn.sourceTop = 184
        prevBtn.sourceWidth = 74
        prevBtn.sourceHeight = 74
        prevBtn.hAlign = 'right'
        prevBtn.vAlign = 'top'
        prevBtn.positionX = -105
        prevBtn.positionY = -10
        prevBtn.width=40
        prevBtn.height=40
        prevBtn.isPointerBlocker = true
        
        prevBtn.onClick = new OnClick(() => {
            //this.toggleLift.sourceLeft = 503
            //this.axis.getComponent(Transform).position.y = 1
            log("clicked PREV")
            
            engine.addSystem(new ClickAnimationSystem(prevBtn))

            if(this.onPlayPrev) this.onPlayPrev()
        })
        


        const runOfShowPauseBtn = this.runOfShowPauseBtn = new UIImage(this.uiMaximizedContainer, imageTexture)
        runOfShowPauseBtn.sourceLeft = 178
        runOfShowPauseBtn.sourceTop = 454
        runOfShowPauseBtn.sourceWidth = 74
        runOfShowPauseBtn.sourceHeight = 74
        runOfShowPauseBtn.hAlign = 'right'
        runOfShowPauseBtn.vAlign = 'top'
        runOfShowPauseBtn.positionX = -60// + 45
        runOfShowPauseBtn.positionY = -10 + -120
        runOfShowPauseBtn.width=40
        runOfShowPauseBtn.height=40
        runOfShowPauseBtn.isPointerBlocker = true

        runOfShowPauseBtn.onClick = new OnClick(() => {
            //this.toggleLift.sourceLeft = 503
            //this.axis.getComponent(Transform).position.y = 1
            log("ROS play clicked")
            
            host.runOfShowPlayBtn.visible = true
            host.runOfShowPauseBtn.visible = false
            engine.addSystem(new ClickAnimationSystem(host.runOfShowPlayBtn))
            //engine.addSystem(new ClickAnimationSystem(pauseBtn))

            if(this.onRunOfShowPause) this.onRunOfShowPause()
        })

        const runOfShowPlayBtn = this.runOfShowPlayBtn = new UIImage(this.uiMaximizedContainer, imageTexture)
        //runOfShowPlayBtn.sourceLeft = 97
        //runOfShowPlayBtn.sourceTop = 274
        runOfShowPlayBtn.sourceLeft = 97 + 81
        runOfShowPlayBtn.sourceTop = 274 + 90
        runOfShowPlayBtn.sourceWidth = 74
        runOfShowPlayBtn.sourceHeight = 74
        runOfShowPlayBtn.hAlign = 'right'
        runOfShowPlayBtn.vAlign = 'top'
        runOfShowPlayBtn.positionX = -60// + 45
        runOfShowPlayBtn.positionY = -10 + -120
        runOfShowPlayBtn.width=40
        runOfShowPlayBtn.height=40
        runOfShowPlayBtn.isPointerBlocker = true
        runOfShowPlayBtn.visible = false

        runOfShowPlayBtn.onClick = new OnClick(() => {
            //this.toggleLift.sourceLeft = 503
            //this.axis.getComponent(Transform).position.y = 1
            log("clicked ROS PLAY")
            
            host.runOfShowPlayBtn.visible = false
            host.runOfShowPauseBtn.visible = true
            engine.addSystem(new ClickAnimationSystem(host.runOfShowPauseBtn))

            if(this.onRunOfShowPlay) this.onRunOfShowPlay()
        })
        


        const restartRunOfShow = this.restartRunOfShow = new UIImage(this.uiMaximizedContainer, imageTexture)
        restartRunOfShow.sourceLeft = 908
        restartRunOfShow.sourceTop = 274 + 90
        restartRunOfShow.sourceWidth = 74
        restartRunOfShow.sourceHeight = 74
        restartRunOfShow.hAlign = 'right'
        restartRunOfShow.vAlign = 'top'  
        restartRunOfShow.positionX = -105// + 45
        restartRunOfShow.positionY = -10 + -120 
        restartRunOfShow.width=40
        restartRunOfShow.height=40 
        restartRunOfShow.isPointerBlocker = true
        //restartRunOfShow.visible = false

        restartRunOfShow.onClick = new OnClick(() => {
            //this.toggleLift.sourceLeft = 503
            //this.axis.getComponent(Transform).position.y = 1
            log("clicked ROS RESET")
            
            host.runOfShowPlayBtn.visible = false
            host.runOfShowPauseBtn.visible = true
            engine.addSystem(new ClickAnimationSystem(host.restartRunOfShow))

            if(this.onRunOfShowRestart) this.onRunOfShowRestart()
        })
        
        


        this.displayName = new UIText(this.uiMaximizedContainer)
        this.displayName.hAlign = 'center'
        this.displayName.vAlign = 'bottom'
        this.displayName.positionY = 130//220
        this.displayName.positionX = 0
        this.displayName.height = 10
        this.displayName.fontSize = 12
        this.displayName.hTextAlign = "center"

        
        this.videoStatus = new UIText(this.uiMaximizedContainer)
        this.videoStatus.hAlign = 'center'
        this.videoStatus.vAlign = 'bottom'
        this.videoStatus.positionY = 110
        this.videoStatus.positionX = 0
        this.videoStatus.height = 10
        this.videoStatus.fontSize = 12
        this.videoStatus.hTextAlign = "center"


        this.playTimes = new UIText(this.uiMaximizedContainer)
        this.playTimes.hAlign = 'center'
        this.playTimes.vAlign = 'bottom'
        this.playTimes.positionY = 90
        this.playTimes.positionX = 0
        this.playTimes.height = 10
        this.playTimes.fontSize = 12
        this.playTimes.hTextAlign = "center"



        // Minimize> button
        this.minimizeButton = new UIImage(this.uiMaximizedContainer, imageTexture)
        this.minimizeButton.sourceLeft = 908
        this.minimizeButton.sourceTop =  544
        this.minimizeButton.sourceWidth = 74
        this.minimizeButton.sourceHeight = 74
        this.minimizeButton.hAlign = 'right'
        this.minimizeButton.vAlign = 'bottom'
        this.minimizeButton.positionX = -15
        this.minimizeButton.positionY = 30
        this.minimizeButton.width=40
        this.minimizeButton.height=40
        this.minimizeButton.isPointerBlocker = true
        this.minimizeButton.onClick = new OnClick(() => {
             this.minimizeUI()
             engine.addSystem(new ClickAnimationSystem(this.minimizeButton))
        })
        // ROW 5
        // HUD Caption
        /*
        const videoPlayStatus = new UIText(this.uiMaximizedContainer)
        videoPlayStatus.value = 'Video Play Status'
        videoPlayStatus.color = Color4.White()
        videoPlayStatus.hAlign = 'center'
        videoPlayStatus.vAlign = 'bottom'
        videoPlayStatus.paddingTop = 0
        videoPlayStatus.paddingBottom = 5
        videoPlayStatus.paddingLeft = 15
        videoPlayStatus.fontSize = 12
        videoPlayStatus.positionY = +15
        //maximizedLabel.fontWeight = 'bold'
        videoPlayStatus.isPointerBlocker = false*/


        const maximizedLabel = new UIText(this.uiMaximizedContainer)
        maximizedLabel.value = 'Show Manager'
        maximizedLabel.color = Color4.White()
        maximizedLabel.hAlign = 'center'
        maximizedLabel.vAlign = 'bottom'
        maximizedLabel.paddingTop = 0
        maximizedLabel.paddingBottom = 5
        maximizedLabel.paddingLeft = 15
        maximizedLabel.fontSize = 12
        //maximizedLabel.fontWeight = 'bold'
        maximizedLabel.isPointerBlocker = false

        // Now that it is all set up, minimize it
        this.minimizeUI()
    }

    setSnaps() {
        
    }
    applyModeAndSnapLabels(){
        
    }

    maximizeUI(){
        this.uiMinimizedContainer.visible = false
        this.uiMaximizedContainer.visible = true
        this.uiMaximized = true
        /*if (this.selectedEntityIndex >=0 && this.numEntities >0) {
            engine.addEntity(this.selectionPointer)
        }*/
        //this.mode=this.modePOSITION
        this.applyModeAndSnapLabels()
        this.displayName.value = "display name"//this.entities[this.selectedEntityIndex].entity.name
        //this.scaffolding.getComponent(Transform).scale = this.scaffoldScale
        //this.axis.getComponent(Transform).scale = Vector3.One()
    }
    minimizeUI(){
        this.uiMaximizedContainer.visible = false
        this.uiMinimizedContainer.visible = true
        this.uiMaximized = false
        /*if (this.selectedEntityIndex >=0 && this.numEntities >0) {
            engine.removeEntity(this.selectionPointer)
        }*/
        //this.scaffolding.getComponent(Transform).scale = Vector3.Zero()
        //this.axis.getComponent(Transform).scale = Vector3.Zero()
    }
    showUI() {
        this.canvas.visible = true
        this.canvas.isPointerBlocker = true
    }
    hideUI(){
        this.canvas.visible = false
        this.canvas.isPointerBlocker = false
    }
    selectEntity(selectedEntityIndex:number){
        /*this.selectedEntityIndex = selectedEntityIndex
        if (this.entities[selectedEntityIndex].entity == null){
            return
        }
        this.displayName.value = this.entities[this.selectedEntityIndex].entity.name
        this.selectionPointer.setParent(this.entities[selectedEntityIndex].entity)
        //if (!this.uiMaximized) { // when you set the entity's parent, the entity is added to the engine if the parent is already added 
        //    engine.removeEntity(this.selectionPointer)  // TODO will this ever occur when pointer isn't in engine?
        //}
        let selectedEntityTransform:Transform = this.entities[selectedEntityIndex].entity.getComponent(Transform)
        let y = selectedEntityTransform.position.y + this.selectionPointerElevation
        //CF TODO if we ever want to align the pointer with the object, e.g. if not rotating it, then find better way, because this one ties the parent entity and pointer entity's rotations together:
        //this.selectionPointer.addComponentOrReplace(new Transform({position:new Vector3(selectedEntityTransform.position.x, selectedEntityTransform.position.y+this.selectionPointerElevation, selectedEntityTransform.position.z), rotation: selectedEntityTransform.rotation}))
        let t = new Transform({
            position:new Vector3(0, y, 0),
            scale: new Vector3( // compensate for any scale changes the selected (parent) entity may have on the pointer scale
                this.selectionPointerScale/this.entities[selectedEntityIndex].transform.scale.x,
                this.selectionPointerScale/this.entities[selectedEntityIndex].transform.scale.y,
                this.selectionPointerScale/this.entities[selectedEntityIndex].transform.scale.z,
                )
            })
        this.selectionPointer.addComponentOrReplace(t)
        // adding/removing it from engine is done with maximimizing/minimizing HUD
        
        this.rotator.setup(this.selectionPointer,100)*/
    }

    selectPrevious(){
        //if (this.selectedEntityIndex>0)
        //    this.selectEntity(this.selectedEntityIndex-1)
    }
    selectNext(){
        //if (this.selectedEntityIndex<this.numEntities-1)
        //    this.selectEntity(this.selectedEntityIndex+1)
    }
    discardSelected(){
        log("Discard Selected Entity isn't implemented at this time.")
        // TODO implement
        // be sure to leave the selection on the previous item
        // don't discard any bExisting ones
    }

    toggleCameraOptions(){
       /* this.movingSystem.addCameraPosition(new Vector3(8,8,8))
        log(this.movingSystem.positions)
        this.scaffolding.addComponent(new Moving("","fixed",0))*/
    }

    round(n:number):number{
        return Math.floor((n+0.00049)*1000)/1000
    }
    dump(){
        this.unsavedContainer.visible = false
        // Write the pseudo spawnEntity code for all the entities to the console
        log("--------------- BuilderHUD entities -------------")
       
        log("-------------------------------------------------")
    }
    destroy(){
        this.dump()
        
        //this.numEntities=0
        this.refreshDisplay()
    }
    refreshDisplay (){
        //TODO update the list of objects etc. in HUD
    }
}


export class hudDelay {
    timer: number = 4
    hud:ShowHUD
    entities:Entity[] = []

    constructor(hud:ShowHUD){
        this.hud = hud
    }

    pendingEntity(entity:Entity){
        this.entities.push(entity)
    }

    update(dt: number) {
        if (this.timer > 0) {
          this.timer -= dt
        } else {
          this.timer = 4
          /*/for(var i = 0; i < this.entities.length; i++){
              log("here")
              this.hud.attachToEntity(this.entities[i], true)
          }*/
          this.entities = []
        }
    }
}

 /*
export var hud = new ShowHUD()
log("after hud")
hud.pendingEntityAdd = new hudDelay(hud)
engine.addSystem(hud.pendingEntityAdd)
*/
export class ClickAnimationSystem {

    uiIMage:UIImage
    timer = .1

    constructor(image:UIImage){
        this.uiIMage = image
    }
  update(dt: number) {
    if (this.timer > 0) {
        this.uiIMage.opacity -= .3
        this.timer -= dt
    } else {
        this.timer = .1
        this.uiIMage.opacity = 1
        engine.removeSystem(this)
    }
  }
}


