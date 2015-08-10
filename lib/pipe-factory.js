var fs = require('fs');
var _ = require('highland');
var utils = require('./utils.js');
var srcSignatures = require('./src-signatures.js');
var source = require('tosource');

var referenceTypeStrings = {
	" String": /function String\(\) { \[native code\] }/g,
	" Number": /function Number\(\) { \[native code\] }/g,
	" Array": /function Array\(\) { \[native code\] }/g,
	" Function": /function Function\(\) { \[native code\] }/g,
	" Object": /function Object\(\) { \[native code\] }/g
};


srcSignatures('../node_modules/highland/lib/index.js')
.filter(isStreamMethod)
.map(require('./polymer-spec.js'))
.map(buildScript)
.each(storeScript);

function isStreamMethod(o){
	return /Stream\./.test(o.name)
}

function buildScript(spec){
	console.log("Building element script: "+spec.is); 
	return { 
		is: spec.is, 
		script: [
			'<link rel="import" href="../polymer/polymer.html">',
			'<script src="./lib/utils.js"></script>',
			'<script src="../highland/dist/highland.js"></script>',
			'<!--', 
				'\tA pipe-line element wrapping highland method:',
				'\t' + spec.properties._src.value.replace(/{|}/g, ''),
			'-->',
			'<dom-module id="' + spec.is + '">',
		  		'\t<style></style>',
		  		'\t<template>',
		    		'\t\t<div id="content">',
		      			'\t\t\t<content></content>',
		    		'\t\t</div>',
		  		'\t</template>',
			'</dom-module>',
			"<script>", 
				"\tPolymer(", 
					Object.keys(referenceTypeStrings).reduce(
						function(srcStr, refType){
							return srcStr.replace(referenceTypeStrings[refType], refType)
						},
						source(spec)
					), 
				"\t)",
			"</script>"
		].join('\n')
	}
}

function storeScript(bld){
	console.log("Storing element script: "+bld.is);
	console.log(bld);
	fs.createWriteStream('../'+bld.is+'.html').write(bld.script);
}