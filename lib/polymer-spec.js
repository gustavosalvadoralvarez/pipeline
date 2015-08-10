var utils = require('./utils.js');


function polymerSpec(src){
	var elName, elType, props; 
	props = {}; 
	elType = Array.isArray(src.section) 
			? src.section[0] 
			: src.section;
	props._src = {
		type: String,
		notify: true,
		readOnly: true,
		value: JSON.stringify(src, null, '\t'),
	};
	props.stream = { 
		type: Object,
		notify: true,
		readOnly: true
	};
	props.streamType = {
		type: String,
		readOnly: true,
		value: elType
	};
	props.method = {
		type: String,
		readOnly: true,
		value: src.id
	};
	if (src.param) { 
		src.param
		.map(argSpec)
		.reduce(utils.extendFilter, props);
		props._param = {
			type: Array,
			readOnly: true, 
			value: function () {
				return JSON.parse(this._src).param.map(utils.getKeyFrom('id'))
			}
		};
	}
	return {
		is: src.id + '-pipe',
		properties: props,
		_fnArg: function (func, returnValue){ 
			return function(arg0, arg1, arg2, arg3, arg4){
				var args = utils.asArray(arguments);
				if (func !== ''){
					return eval(func).apply(null, args)
				} else if (returnValue !== ''){ 
					console.log(returnValue);
					return eval(returnValue)
				}
			}
		},
		'<|':  function pipeIn(stream){ 
			var self, m;
			self = this; 
			console.log("Linking "+self.method+"-stream...");
			self._setStream(
				stream[self.method].apply(
					stream,
					self._param.map(
						function(arg){
							return self[arg];
						}
					)
				)
			);
			return self.stream
		}, 
	}
	function argSpec(arg){
		var argType, argName, argDesc, spec;
		argType  = arg.type;
		argName = arg.name;
		argDesc = arg.desc;
		if (argType === null || argType.indexOf('|') !== -1){
			argType = 'Object';
		}
		spec = {};
		switch (argType){
			case 'Function':
				var sr, sf, ac, dsc;
				sr = argName+'-return';
				sf = argName+'-function';
				ac = '_fnArg('+sf+','+sr+')';
				spec[sr] = {
					type: String,
					reflectToAttribute: true,
					notify: true,
					value: ''
				},
				spec[sf] = {
					type: String,
					reflectToAttribute: true,
					notify: true,
					value: ''
				};
				spec[argName] = {
					type: Function,
					computed: ac
				};
				break;
			case 'Array':
				spec[argName] = {
					type: Array,
					notify: true,
					reflectToAttribute: true
				};
				break;
			case 'Number':
				spec[argName] = {
					type: Number,
					notify: true,
					reflectToAttribute: true
				};
				break;
			case 'String':
				spec[argName] = {
					type: String,
					notify: true,
					reflectToAttribute: true
				};
				break;
			case 'Object':
				spec[argName] = {
					type: Object,
					notify: true,
					reflectToAttribute: true
				};
				break;
			default: 
				if (argType.indexOf("Stream") !== -1){
					spec[argName+"-selector"] = {
						type: Object,
						notify: true,
						reflectToAttribute: true
					};
				} else {
					return new Error('Unrecognized param type: '+argType)
				}
		}
		return spec;
	}
}

module.exports = polymerSpec;