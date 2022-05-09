import * as utils from '@dcl/ecs-scene-utils'


export class SyncedEntityExtConstructorArgs{
  events?: (() => void)[]
}

export type SyncedEntityVideoExtConstructorArgs = SyncedEntityExtConstructorArgs & {}

export type SyncedEntityModelExtConstructorArgs = SyncedEntityExtConstructorArgs & {
  startInvisible?: boolean
  transform?: TransformConstructorArgs
  idleAnim?: string
  events?: (() => void)[]
}

export interface ShowEntity {
  appear:() => void
  hide:() => void
  play:() => void
  stop:() => void

  triggerEvent: (index: number)=>void
}

/**
 * implements the interface so extenders can choose what to override
 */
export class ShowEntitySupport implements ShowEntity {
  public events: (() => void)[] = []

  appear(){}
  hide(){}
  play() {}
  stop() {}

  triggerEvent(index: number) {
    if (this.events[index]) {
      this.events[index]()
    }
  }
}
