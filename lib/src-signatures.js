var fs = require('fs');
var _ = require('highland');
var utils = require('./utils.js');

function srcSignatures(srcFile, dst){
	var execNxt;

	if (typeof dst.pipe !== 'undefined' ){
		execNxt = function (stream) {
			stream.pipe(dst);
		};
	} else if (utils.protoTypeOf(dst) === "Function") {
		execNxt = function (stream) {
			stream.toArray(dst)
		};
	} else if (utils.protoTypeOf(dst) === "String" && dst.split('.').slice(-1)[0] === 'json'){
		execNxt = function (stream) {
			stream
			.collect()
			.map(
				function(d){
					return JSON.stringify(d, null, '\t')
				}
			)
			.pipe(
				fs.createWriteStream(dst)
			);
		};
	} else {
		console.log("Warning: no valid dst argument receceived, defaulting to stdout");
		console.log(dst);
		console.log(dst.split('.').slice(-1));
		execNxt = function (stream) {
			stream.map(
				function(d){
					return JSON.stringify(d, null, '\t')
				}
			)
			//.pipe(process.stdout);
		};
	}

	_(fs.createReadStream(srcFile))
	.split() 
	.filter(isSigLine)
	.collect()
	.map(parseSignatures)
	.each(execNxt);

	function isSigLine(ln){
		return /^\s\*\s@.*$/.test(ln)
	}
	function parseParam(arr){
		var typ, ps, po;
		po = {};
		ps = arr.join(' ').split('-');
		typ = ps[0].match(/{(.*)}/) || ['', null];
		po.type = typ[1];
		po.name = ps[0].replace(typ[0], '').replace(/\./g,'').trim();
		po.desc = ps.length > 1 
			  	? ps.slice(1).join(' ').trim()
			  	: null;
		return po
	}
	function parseSignatures(sigLns){
		return _(
			utils.collectBetween(
				sigLns.map(
					function removeHead(ln){
						return ln.split('').slice(4).join('')
					}
				), 
				function isIdLn(ln){
					return /^id.*$/.test(ln)
				}
			)
		)
		.map(
			function toObj(sig){
				var o, fo, k;
				o = utils.flattenSingles(
					sig.reduce(
						function (acc, sln){
							var ps, k;
							ps = sln.replace('* @', '').split(' ');
							k = ps[0];
							if (k in acc){
								acc[k] = acc[k].concat([ps.slice(1, ps.length)]);
							} else {
								acc[k] = [ps.slice(1, ps.length)];
							}
							return acc
						}, 
						{}
					)
				);
				if (Array.isArray(o.param)){
					var prms;
					prms = o.param;
					if (Array.isArray(prms[0])){
						o.param = prms.map(parseParam);
					}else{
						o.param = parseParam(prms);
					}
				}
				if (Array.isArray(o.name)){
					o.name = o.name.join(' ');
				}
				return o
			}
		)
	}
}


var srcFl = process.argv[2];
var dstFl = process.argv[3];
if (srcFl && dstFl){
	srcSignatures(srcFl, dstFl);
}

module.exports = srcSignatures;



