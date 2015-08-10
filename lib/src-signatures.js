var fs = require('fs');
var _ = require('highland');
var utils = require('./utils.js');

function srcSignatures(srcFile, dst){
	var throughStream;
	throughStream = _(fs.createReadStream(srcFile))
					.split() 
					.filter(isSigLine)
					.collect()
					.map(parseSignatures)
					.flatten();

	if (utils.protoTypeOf(dst) === "Function") {
		throughStream.each(throughStream);
		return
	} 
	if (
		utils.protoTypeOf(dst) === "String" && 
		dst.split('.').slice(-1)[0] === 'json'){
		stream
		.collect()
		.map(function(d){ return JSON.stringify(d, null, '\t') })
		.pipe(fs.createWriteStream(dst));
		return
	} 

	return throughStream 

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
				sigLns.map(function rmHead(ln){ return ln.split('').slice(4).join('') }), 
				function isIdLn(ln){ return /^id.*$/.test(ln) }
			)
		)
		.map(
			function sigObj(sig){
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
						o.param = [parseParam(prms)];
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

srcSignatures('../node_modules/highland/lib/index.js')
.map(utils.JSON.prettyStringifyMap)
.pipe(process.stdout);

module.exports = srcSignatures;

