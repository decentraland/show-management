import * as utils from '@dcl/ecs-scene-utils'
import { ShowEntitySupport, SyncedEntityVideoExtConstructorArgs } from './showEntity'



export class ShowEntityVideoTexture extends ShowEntitySupport {
   myVideoTexture:VideoTexture

   constructor(
    name:string,
    myVideoTexture: VideoTexture,
    extArgs: SyncedEntityVideoExtConstructorArgs
  ) {
    super()

    this.myVideoTexture = myVideoTexture
  }

   play(): void {
     this.myVideoTexture.play()
   }
   stop(): void {
    this.myVideoTexture.pause()
  }
}