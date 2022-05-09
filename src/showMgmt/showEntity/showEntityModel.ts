import * as utils from '@dcl/ecs-scene-utils'
import { ShowEntitySupport, SyncedEntityModelExtConstructorArgs } from './showEntity'


export class ShowEntityModel extends ShowEntitySupport {
  public idleAnim: AnimationState | null = null
  public lastPlayedAnim: AnimationState | null = null
  public endAnimTimer: Entity
  public intervalAnimTimer: Entity
  public entity:Entity
  constructor(
    name:string,
    model: GLTFShape,
    extArgs: SyncedEntityModelExtConstructorArgs
  ) {
    super()

    this.entity = new Entity(name)

    this.entity.addComponent(model)

    this.entity.addComponent(
      new Transform(
        extArgs.transform
          ? extArgs.transform
          : {
              position: new Vector3(0, 0, 0),
              scale: new Vector3(1, 1, 1),
              rotation: Quaternion.Euler(0, 0, 0),
            }
      )
    )
    this.entity.addComponent(new Animator())

    if (extArgs.startInvisible) {
      this.hide()
    }

    if (extArgs.idleAnim) {
      this.idleAnim = new AnimationState(extArgs.idleAnim, { looping: true })
      this.entity.getComponent(Animator).addClip(this.idleAnim)
      this.idleAnim.play()
    }

    //this.setParent(_scene)
    engine.addEntity(this.entity)

    if (extArgs.events) {
      this.events = extArgs.events
    }


    this.endAnimTimer = new Entity()
    engine.addEntity(this.endAnimTimer)

    this.intervalAnimTimer = new Entity()
    engine.addEntity(this.intervalAnimTimer)
    return this
  }
  appear() {
    this.entity.getComponent(GLTFShape).visible = true
  }
  hide() {
    this.entity.getComponent(GLTFShape).visible = false
  }
  /**
   * 
   * @param animationName 
   * @param noLoop 
   * @param duration 
   * @param speed 
   * @param interval 
   * @param resetAnim (optional; defaults:true) resets the animation before playing. if it was paused dont reset 
   *  makes sense to  only finish out the animation if anim loop=false and did not get to the end before next play 
   *  it will only finish  out the rest of the loop which could be .01 seconds or 5 seconds
   */
  playAnimation(
    animationName: string,
    noLoop?: boolean,
    duration?: number,
    speed?: number,
    interval?: number,
    resetAnim?: boolean,
    layer?:number
  ) {
    // if (this.lastPlayedAnim) {
    //   this.lastPlayedAnim.stop()
    // }

    if (this.endAnimTimer.hasComponent(utils.Delay)) {
      this.endAnimTimer.removeComponent(utils.Delay)
    }

    if (this.intervalAnimTimer.hasComponent(utils.Interval)) {
      this.intervalAnimTimer.removeComponent(utils.Interval)
    }

    if (!this.entity.getComponent(GLTFShape).visible) {
      this.entity.getComponent(GLTFShape).visible = true
    }

    const animator = this.entity.getComponent(Animator)
    
    let newAnim = this.entity.getComponent(Animator).getClip(animationName)
    if(layer) newAnim.layer = layer 

    //log("resetting ",newAnim)
    const resetAnimation = resetAnim === undefined || resetAnim
    if(resetAnimation){
      //log("resetting ",newAnim)
      newAnim.reset()
    }

    if (speed) {
      newAnim.speed = speed
    } else {
      newAnim.speed = 1
    }  
    
    if (noLoop) {
      newAnim.looping = false
    }else{
      newAnim.looping = true
    }
    if(noLoop){
      if (interval && duration) {
        playOnceAndIdle(this, newAnim, duration,resetAnimation) 
        this.intervalAnimTimer.addComponentOrReplace(
          new utils.Interval(interval * 1000, () => {
            playOnceAndIdle(this, newAnim, duration)
          })
        )
      } else if (duration) {
        // play once & idle
        playOnceAndIdle(this, newAnim, duration,resetAnimation) 
      } else {
        // play once and stay on last frame
        newAnim.looping = false
        //log("playAnimation playing and not calling reset ",newAnim)
        newAnim.play(resetAnimation)
        this.lastPlayedAnim = newAnim
      }
    } else {
      newAnim.looping = true
      
      //   newAnim.stop()
      //log("playing with reset ",newAnim)
      newAnim.play(resetAnimation)

      handlePlayDuration(this,newAnim,duration)

      this.lastPlayedAnim = newAnim
      
    }
  }
  play(): void {
    this.playIdleAnimation()
  }
  stop(): void {
    this.stopAllAnimations()
  }
  playIdleAnimation() {
    // if (this.lastPlayedAnim) {
    //   this.lastPlayedAnim.stop()
    // }

    if (this.idleAnim) {
      this.idleAnim.play()
      this.lastPlayedAnim = this.idleAnim
    }
  }
  setNewIdleAnim(animName: string) {
    if (this.idleAnim) {
      this.idleAnim.stop()
    }

    this.idleAnim = new AnimationState(animName, { looping: true })
    this.entity.getComponent(Animator).addClip(this.idleAnim)
    this.idleAnim.play()
    this.lastPlayedAnim = this.idleAnim
  }
  stopAllAnimations() {
    if (this.lastPlayedAnim) {
      this.lastPlayedAnim.stop()
    }
  }

}

/**
 * 
 * @param ent 
 * @param anim 
 * @param duration 
 * @param resetAnim (optional; defaults:true)  resets the animation before playing. if it was paused dont reset makes sense to 
 *  only finish out the animation if anim loop=false and did not get to the end before next play it will only finish 
 *  out the rest of the loop which could be .01 seconds or 5 seconds
 */
export function playOnceAndIdle(
  ent: ShowEntityModel,
  anim: AnimationState,
  duration: number,
  resetAnim?: boolean 
) {
  //   if (ent.lastPlayedAnim) {
  //     ent.lastPlayedAnim.stop()
  //   }

  //anim.looping = false
  //log("playOnceAndIdle and not calling reset ",anim)
  if(resetAnim) anim.reset()
  anim.play()
  ent.lastPlayedAnim = anim
  handlePlayDuration(ent,anim,duration)
}

function handlePlayDuration(ent: ShowEntityModel,anim: AnimationState,duration?:number){
  if (duration) {
    ent.endAnimTimer.addComponentOrReplace(
      new utils.Delay(duration * 1000, () => {
        // if (ent.lastPlayedAnim) {
        //   ent.lastPlayedAnim.stop()
        // }
        anim.stop()
        if (ent.idleAnim) {
          ent.idleAnim.play()
          ent.lastPlayedAnim = ent.idleAnim
        }
      })
    )
  }
}
