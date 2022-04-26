
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

// https://tc39.es/ecma262/#sec-string.prototype.startswith
export function startsWith(str:string,searchStr:string,pos:number) {
	//var O = RequireObjectCoercible(this);
	//var S = ToString(O);
	//if (IsRegExp(searchString)) {
	//	throw TypeError('Argument to String.prototype.startsWith cannot be a RegExp');
	//}
	//var searchStr = ToString(searchString);

	//var pos = ToInteger(arguments.length > 1 ? arguments[1] : undefined);
	var len = str.length;
	var start = Math.min(Math.max(pos, 0), len);
	var searchLength = searchStr.length;

	// Avoid the `indexOf` call if no match is possible
	if (searchLength + start > len) return false;

	var index = -1;
	while (++index < searchLength) {
		if (str.charAt(start + index) != searchStr.charAt(index)) {
			return false;
		}
	}
	return true;
};

/**
 * varient on https://tc39.es/ecma262/#sec-string.prototype.startswith
 * 
 * will check if starts with BUT also includes the optional followedBy which would be a string followed by
 * 
 * "ACTION" vs "ACTION " will both pass
 * 
 * this should be more performant to avoid new string creation
 * 
 * @param str 
 * @param searchStr 
 * @param pos 
 * @param followedBy 
 * @returns 
 */
export function actionStartsWith(str:string,searchStr:string,pos?:number,followedBy?:string):boolean{
  if(!str) return false
  
  const len = str.length;
	const start = Math.min(Math.max(pos?pos : 0, 0), len);
	const searchLength = searchStr.length;
  
	// Avoid the `indexOf` call if no match is possible
	if (searchLength + start > len) return false;
      
  
	let index = -1;
	while (++index < searchLength) {
		if (str.charAt(start + index) != searchStr.charAt(index)) {
			return false;
		} 
	}         
  //debugger  
  //check if followed by optionalFollowedBy (optional)
  if(followedBy !== undefined && len > (start + index)){
    let indexDelim = -1;
    const dimLength = followedBy.length; 
    
    index = searchLength - 1 
    while (++indexDelim < dimLength) {
      index++
      if (str.charAt(start + index) != followedBy.charAt(indexDelim)) {
        return false; 
      }  
    } 
  }
	return true;
}

/*
log("tests")
type TestInput={
  str:string
  pass:boolean
}
const testVals = [
  {str:"ACTION",pass:true},
  {str:"ACTION 2",pass:true},
  {str:"ACTION2",pass:true},
  {str:"XACTION 2",pass:true},
  {str:"XACTION2",pass:true},
  {str:"ACTION",pass:true}
]
let counter = 0
for(const p in testVals){
  log(counter,"actionStartsWith ",testVals[p],actionStartsWith(testVals[p].str,"ACTION"))
  log(counter,"actionStartsWith spaceDelim",testVals[p],actionStartsWith(testVals[p].str,"ACTION",0," "))
  counter++
}*/