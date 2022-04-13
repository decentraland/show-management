
  /*
  getWorldTime(){
    return this.latestWorldTime
  }*/
  export async function  fetchWorldTime():Promise<Date> {
    let url = 'https://worldtimeapi.org/api/timezone/etc/gmt'
  
    let toDate:Date
    //if (playerFar) return
    try {
      
      let response = await fetch(url)
      let json = await response.json()
      
      log(json.datetime)
  
      toDate = new Date(json.datetime) 

      return toDate
    } catch (e) {
      log('error getting time data ', e)
      //fallback to player time
      toDate = new Date()
    }
    return toDate 
  }

  //log(fetchWorldTime())