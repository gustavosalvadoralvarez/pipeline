var fs = require('fs');
var _ = require('highland');
var utils = require('./utils.js');

_(fs.createReadStream('../node_modules/highland/lib/index.js'))
.split() // examine lines
.filter( // keep only methond signatures
	function(ln){
		return /^\s\*\s@.*$/.test(ln)
	}
).toArray(
	function (sigLns){
		var sigs;
		sigs = utils.collectBetween(
			sigLns.map(
				function removeHead(ln){
					return ln.split('').slice(4).join('')
				}
			), 
			function isIdLn(ln){
				return /^id.*$/.test(ln)
			}
		).map(
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

				}
				return o
			}
		);
		console.log(JSON.stringify(sigs, null, '\t'));

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
	}
);
