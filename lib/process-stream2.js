
function processStream(signature) {
  var elName, props; 
  if (!utils){ 
    return new Error("Missing dependency: \n\tutils.js");
  }
  if (!Polymer){ 
    return new Error("Missing dependency: \n\tPolymer");
  }
  if (!signature.name){ 
    return new Error("Must provide a method name");
  }
  if (signature){ 
    props = {}; 
    props.stream = { 
      type: Object,
      notify: true,
      readOnly: true
    };
    props.isProcStream = {
      type: Boolean,
      readOnly: true,
      value: true
    };
    props.method = {
      type: String,
      readOnly: true,
      value: signature.name
    };
    if (signature.param) { 
      signature.param
      .map(argSpec)
      .reduce(utils.extendFilter, props);
  
      props.args = {
        type: Array,
        readOnly: true,
        value: function() { 
          return args.map(
            function(arg){
              return arg.name;
            }
          )
        }
      };
    }
  } else {
    return new Error('No method specified for process-stream');
    return
  }
  elName = signature.name + '-stream';
  return Polymer({
    is: elName,
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
          self.args.map(
            function(arg){
              return self[arg];
            }
          )
        )
      );
      return self.stream
    }, 
  });
   function argSpec(arg){
        var argType, argName;
        argType  = arg.type;
        argName = arg.name;
        if (argType.indexOf('|') !== -1){
          argType = 'Object';
        }
        var spec;
        spec = {};
        switch (argType){
          case 'Function':
            var sr, sf, ac;
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
          default: 
            if (argType.indexOf("Stream") !== -1){
              spec[argName+"-selector"] = {
                type: Object,
                notify: true,
                reflectToAttribute: true
              };
            } else if (argType === null || argType === 'Object'){
               spec[argName] = {
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
