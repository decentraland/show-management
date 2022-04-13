import { fetchWorldTime } from './utils'

let PLAYING_DEFAULT: boolean = false


export class TimeProvider{
 
  promise:Promise<Date>
  whenMeasured:Date
  worldTime:Date

  constructor(){
  
  }

  async waitTillReady(){
    return this.promise
  }

  async getTime(){
    if(this.promise === undefined){
      this.worldTime = new Date()
      this.whenMeasured = new Date()

      this.promise = fetchWorldTime()

      this.promise.then((date:Date)=>{
        this.worldTime = date
      })
    }
    return this.promise
  }
 
  now():number{
    //calculates world time offset
    return this.worldTime.getTime() + (Date.now()-this.whenMeasured.getTime())
  }
  
}
