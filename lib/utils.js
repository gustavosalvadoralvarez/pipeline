
var utils = {}; 

function hasProperty(o, p){
	return !!o[p]
}

function protoTypeOf(o){
	return Object.prototype.toString.call(o).replace(/(\[object\s)|(\])/g, '')
}

utils.protoTypeOf = protoTypeOf;

function asArray(thing){
	var otype;
	otype = protoTypeOf(thing);
	if (otype in toSet(['Arguments', 'NodeList', 'HTMLCollection'])){
		return Array.prototype.slice.call(thing);
	}
	if (otype === 'Array'){ 
		return thing
	}
	return [thing]
}

utils.asArray = asArray; 

function extensionName (flPath){
	return flPath.split('.').slice(-1)[0]
}

utils.extensionName = extensionName; 

function invoke(methodKey, methodArgs){
	var args = asArray(arguments), 
		methodKey = args[0], 
		methodArgs = args.slice(1);
	return function invocation(obj){
		return obj[methodKey](methodArgs)
	}
}

utils.invoke = invoke;

function getKeyFrom(k){
	return function (o){
		return o[k]
	}
}

utils.getKeyFrom = getKeyFrom;

function getValueFrom(o){
	return function (k){
		return o[k]
	}
}

utils.getValueFrom = getValueFrom;

function returnTo(val){
	return function(args){
		return val
	}
}

utils.returnTo = returnTo; 

function partial(fnRef, pArgs){ 
	var pArgs = Array.prototype.slice.call(arguments, 1);
	return function callWith(rArgs){
		return fnRef.call(
			null, 
			pArgs.concat(Array.prototype.slice.call(rArgs))
		)
	}
}

utils.partial = partial;

function featurize(arr){
	var uniqs, ints;
	uniqs = unique(arr).concat("NA");
	if (!(uniqs.length < arr.length)){
		return{
			values: arr
		}
	}
	ints = arr.map(
		function(v){
			if(!v){
				return "NA"
			}
			return v.toString()
		}
		).map(
			function(v){
				return uniqs.indexOf(v)
			}
		); 
	// console.log({
	// 	levels: uniqs,
	// 	integers: ints
	// });
	return {
		levels: uniqs,
		integers: ints
	}
}

utils.featurize = featurize; 

function car(arr){
	return arr[0]
}

function flattenSingles(val){
	var otype;
	otype = protoTypeOf(val);
	if (otype === "Array" && val.length === 1){
		return flattenSingles(val[0])
	} else if (otype === "Object"){
		return Object.keys(val).reduce(
			function (nval, k){
				nval[k] = flattenSingles(val[k]);
				return nval
			}, 
			{}
		)
	}
	return val
}

utils.flattenSingles = flattenSingles;

function collectBetween(arr, tstFn){
	var tstIxs;
	tstIxs = arr.filter(tstFn);
	return tstIxs.map(
		function(ix, i, tstArr){
			return arr.slice(arr.indexOf(ix), arr.indexOf(tstArr[i+1]))
		}
	)
}

utils.collectBetween = collectBetween;
utils.car = car;

function cdr(arr){ 
	return arr.slice(1)
}

utils.cdr = cdr;

function defeaturize(obj){
	if (obj.values){
		return obj.values
	}
	return obj.integers.map(Number).map(getValueFrom(obj.levels))
}

utils.defeaturize = defeaturize;

function rightPartial(fnRef, pArgs){ 
	var pArgs = Array.prototype.slice.call(arguments, 1);
	return function callWith(rArgs){
		return fnRef.call(
			null, 
			Array.prototype.slice.call(rArgs).concat(pArgs)
		)
	}
}

utils.rightPartial = rightPartial; 

function range(ops, args){
	var to, from, by;

	if(typeof(ops) === 'string' || typeof(ops) === 'number'){
		to = Number(ops) - 1, 
		from = arguments[1]
			? Number(arguments[1]) 
			: 0, 
		by = arguments[2]
			? Number(arguments[2]) 
			:  1;
	} else {
		to = Number(ops.to) - 1, 
		from = Number(ops.from) || 0, 
		by = Number(ops.by) || 1;
	}

	return Array.apply(null, Array(1 + ((to - from) / by))).map(
		function (v, i) { 
				return from + (i * by) 
		}
	)
}

utils.range = range;

function attributeMap(attr){ 
	return function(el){ 
		return el.getAttribute('name')
	}
}

utils.attributeMap = attributeMap;


function repeat(val, times){
	return range(times+1).map(returnTo(val))
}

utils.repeat = repeat;


function toSet(arr){ 
	return arr.reduce(
		function (p, c){ 
			p[c] = '';
			return p
		},
		{}
	);
}

utils.toSet = toSet; 

function binaryFilter(binaryArr){
	return function (v, i){
		return binaryArr[i]
	}
}

utils.binaryFilter = binaryFilter; 

function regExpFilter(re, k){
	if (k){
		return function (o){
			return re.test(o[k])
		}
	}
	return function (o){
		return re.test(o)
	}
}

utils.regExpFilter = regExpFilter;

function booleanMap(booleanArr){
	return function(arr){
		return arr.reduce(
			function(rarr, v, i){
				if (booleanArr[i]){
					rarr = rarr.concat(v);
				}
				return rarr
			},
			[]
		)
	}
}

utils.booleanMap = booleanMap; 


function setDiff(arr1, arr2){ 
	return arr1.concat(arr2).filter(
		function (v, i){ 
			return ((arr1.indexOf(v) === -1) || (arr2.indexOf(v) === -1))
		}
	)
}

utils.setDiff = setDiff; 

function labeledChild(obj, label){
	var labelKey, labelVal, child; 
	labelKey = label || 'label'; 
	labelVal = Object.keys(obj)[0]; 
	child = obj[labelVal]; 
	child[labelKey] = labelVal; 
	return child
}

function extendFilter(acc, o){
	var k;
	for (k in o){
		acc[k] = o[k];
	}
	return acc
}

utils.extendFilter = extendFilter;
utils.labeledChild = labeledChild;

function numericObject(arr){
	return arr.reduce(
		function(o, v, i){
			o[i] = v;
			return 0
		},
		{}
	)
}


function keyCopy(obj, typ){
	typ = typ || String;
	return Object.keys(obj).reduce(function(o, k){ o[k] = typ(); return o }, {})
}

function stripInstanceMethods(o){
	return Object.keys(o).reduce(
		function (r, k){
			var v;
			v = o[k];
			if (!(v instanceof Function)){
				r[k] = v; 
			}
			return r
		},
		{}
	)
}

function propertyKeys(o){
	return Object.keys(o).reduce(
		function(ks, k){
			if (!o[k].call){
				ks = ks.concat(k)
			}
			return ks
		},
		[]
	)
}

function loadInstanceMethods(fns){
	var fnKeys;
	fnKeys = Object.keys(fns);
	return function (inst){
		fnKeys.forEach(
			function (k){
				inst[k] = fns[k];
			}
		);
		return inst
	}
}

function checkEquals(v){
	if(Array.isArray(v)){
		var inV = v.indexOf;
		return function (cv){
			return cv in v
		}
	}
	return 	function (cv){
		return cv === v
	}
}

function keySubset(o, ks){

	return ks.reduce(
		function(r, k){
			r[k] = o[k];
			return r
		}, 
		{}
	)
}

utils.keySubset = keySubset;

function keyMap(ks){
	return function(o){
		return keySubset(o, ks);
	}
}

utils.keyMap = keyMap;


function dCopy(o){
	return JSON.parse(JSON.stringify(o))
}

utils.deepCopy = dCopy; 

function inMemStorage(){
	var store;
	store = {};
	return {
		setItem: function(k, v){
			store[k] = JSON.stringify(v);
			return v
		},
		getItem: function(k){
			return k in store
					? store[k]
					: null;
		}
	}
}

utils.inMemStorage = inMemStorage;

function seqApply(fnF, fnS){
	var fnArr, fnF;
	fnArr = asArray(fns).slice(1); 
	return function(args){
		return fnArr.reduce(
			function(v, fn){
				return fn(v);
			},
			fnF(args)
		)
	}
}

utils.seqApply = seqApply;


function transpose(mx){
	var m, n;
	m = range(mx.length);
	n = range(mx[0].length);
	return n.map(
		function (i){ 
		    return m.map(
			    function(j){
			        return mx[j][i]
			    }
		  	)
		}
    )
}

utils.transpose = transpose; 


function unique(arr){
	return Object.keys(arr.reduce(function findUunique(tmpObj, item){
		if (!(item in tmpObj)){ 
			tmpObj[item] = '';
		}
		return tmpObj
	}, {}))
}

utils.unique = unique; 


function closest(selector, el) {
    function testContainer(el){
    	return el.parentNode.querySelectorAll(selector)
    }
    var matches;
    for ( ; el && el !== document; elem = elem.parentNode ) {
    	matches = testContainer(el); 
    	if (matches.length > 0){ 
    		return matches
    	}
    }

    return false;

}

utils.closest = closest; 

function deepCopy(item){
	return JSON.parse(JSON.stringify(item));
}

utils.deepCopy = deepCopy;


function unSelect(menuEl){
	menuEl.selectedIndex = -1;
}

utils.unSelect = unSelect;

function importText(importLink){
	return importLink.import.querySelector('BODY').textContent
}
utils.importText = importText; 

function jsonImport(importLink){
	return JSON.parse(importText(importLink))
}

function safeParse(o){
	try{
		return JSON.parse(o)
	} catch (e){
		return o
	}
}

function isJSONArray (str) { 
	return /(\[([\w]+,?)+\])/.test(str)
};

function csvArrToJSON(csvArr, noHeaders){
	var headers, vals; 

	if (noHeaders){ 
		headers = range(csvArr[0]).map(
			function (v){ 
				return "X."+String(v)
			}
		);
		vals = csvArr;
	} else { 
		headers = csvArr[0].map(function (v) { return v.replace(/ /g, "_")}); 
		console.log(headers);
		vals = csvArr.slice(1, csvArr.length);
	}
	return vals.map(
		function (row){ 
			return row.reduce(
				function (acc, v, i){ 
					acc[headers[i]] = v;
					return acc
				},
				{}
			)
		}
	)
}

function prettyStringifyMap(o){
	return JSON.stringify(o, null, '\t')
}

utils.JSON = {
	'import': jsonImport,
	'isArray': isJSONArray,
	'fromCSVArray': csvArrToJSON,
	'prettyStringifyMap': prettyStringifyMap
};

function testServer(name, testFiles, port){
	var flRoutes; 
	flRoutes = Object.keys(testFiles); 
	require('http').createServer(
		function (req, res){
			var routeFl, reqURL;
			routeFl = flRoutes.filter(function(k){ return treq.indexOf(k) !== -1 })[0];
			reqURL = req.url; 
			if (routeFl){
				res.statusCode = 200; 
				require('fs').createReadStream(routeFl).pipe(res); 
			} else {
				res.statusCode = 404;
				res.end("Wtf Willis?");
			}
			
		}
	)
}


// function csvStream(){
// 	var _, papa;
// 	_ = (window && window.highland || highland);
// 	papa = (window && window.papa || papa); 
// 	if (!(_ && papa)){
// 		return new Error('Missing dependencies: \n'+
// 			(_  || '' || "\thighland\n")+
// 			(papa  || '' || "\tpapaparse\n")
// 		)
// 	}
// 	return function (v){ 
// 			return _(
// 			function* parseItem(v){
// 				var csvText, yo, step, complete; 
// 				if (v instanceof String){ 
// 					csvText = v;
// 					step = function(row){
// 						yield {row: row};
// 					};
// 				} else if ((v instanceof Object) && (('text' in v) || ('data' in v))){
// 					csvText = v.text || v.data;
// 					yo = deepCopy(v);
// 					delete yo.text;
// 					delete yo.data; 
// 					step = function (row){
// 						yo.row = row; 
// 						yield yo
// 					}
// 				}
// 				complete = function(){
// 					return 
// 				}
// 				papa.parse(
// 					csvText,{ 
// 						step: step,
// 						complete: complete 
// 					}
// 				)
// 			}
// 		)
// 	}
// }


function conditionalStream(thenStream, elseStream, linkMethod){
	var _;
	_ = highland; 
	if (!_){ 
		return Error("Highland not found");
	}
	linkMethod = linkMethod || 'pipe';
	return _.through(
		function (ifRes){
			var cond, data, throughStream; 
			cond = ifRes[0]; 
			data = ifRes[1];
			if (cond){
				throughStream = thenStream.fork();
			} else {
				throughStream = elseStream.fork();
			}
			return data[linkMethod](throughStream)
		}
	)
}


if (typeof module !== 'undefined' && module.exports){
	var k; 
	for(k in utils){
		module.exports[k] = utils[k];
	}
}

utils.conditionalStream = conditionalStream; 