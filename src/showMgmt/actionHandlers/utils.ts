import { ActionParams } from './showActionHandler';


 export function splitByWhiteSpace(str: string):string[] {
  //this split includes the white space as part of array results, so remove it 
  return str.split(/(\s+)/).filter( e => e.trim().length > 0);
}

/**
 * this is not the most flexible but works decently well.  
 * It searched for the first "{" and assumes is your json argument
 * expected a pattern of: 
 * ACTION_NAME TEXT_NO_SPACES TEXT_NO_SPACES2 ... (optional JSON string to be parsed as the very end) 
 *
 * @param str action to parse
 */ 
export function parseActionWithOpts<T>(str: string):ActionParams<T> {
  const indexOfJson = str.indexOf("{")
  const subArr = []
  
  var result:ActionParams<T>={array:[]}

  let splitIdx = str.length
  if(indexOfJson >= 0){
    splitIdx = indexOfJson
  }
  const words = str.substr(0,splitIdx)
  //this split includes the white space as part of array results, so remove it 
  result.array = splitByWhiteSpace(words)
  
  if(indexOfJson >= 0){
    const json = str.substr(indexOfJson)
    result.array.push(json)

    try{
      const obj = JSON.parse(json)
      result.params = obj
    }catch(e){     
      //debugger
      log("FAILED to parse ",str,json,e)
      throw e
    } 
  }

  return result;
}


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