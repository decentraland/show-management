
//removes an item from an array returning a new array without it
export function removeItemFromArray<T>(arr: Array<T>, value: T): Array<T> { 
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

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
