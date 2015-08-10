var fs = require('fs');
var _ = require('highland');
var utils = require('./utils.js');
var srcSignatures = require('./src-signatures.js');

srcSignatures('../node_modules/highland/lib/index.js')
.filter(isStreamMethod)
.map(require('./polymer-spec.js'))
.each(console.log)
//.map(utils.JSON.prettyStringifyMap)
//.pipe(process.stdout);
;

function isStreamMethod(o){
	return /Stream\./.test(o.name)
}