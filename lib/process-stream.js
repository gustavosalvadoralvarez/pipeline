
function processStream(_method) {
  var elName, props; 
  if (!utils){ 
    return new Error("Missing dependency: \n\tutils.js");
  }
  if (!Polymer){ 
    return new Error("Missing dependency: \n\tPolymer");
  }
  if (!_method.name){ 
    return new Error("Must provide a method name");
  }
  if (_method){ 
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
      value: _method.name
    };
    if (_method.arguments) { 
      var args = _method.arguments;
      args.forEach(
        function (arg){
          var argName, argType; 
          argName = arg.name;
          argType = arg.type;
          switch (argType){ 
            case 'function': 
              if (props.returnValue){ 
                return new Error('Only one argument of type function allowed');
              }
              props.returnValue = {
                type: String,
                reflectToAttribute: true,
                notify: true,
                value: ''
              };
              props.func = {
                type: String,
                reflectToAttribute: true,
                notify: true,
                value: ''
              };
              props[argName] = {
                type: Function,
                computed: '_fnArg(func, returnValue)'
              };
            break;
            case 'array': 
              props[argName] = {
                type: Array,
                notify: true,
                reflectToAttribute: true
              };
            break; 
            case 'string': 
              props[argName] = {
                type: String,
                notify: true,
                reflectToAttribute: true
              };
            break;
            case 'object': 
              props[argName] = {
                type: Object,
                notify: true,
                reflectToAttribute: true
              };
            break;
            case 'number': 
              props[argName] = {
                type: Number,
                notify: true,
                reflectToAttribute: true
              };
            break;
            default: 
              return new Error('Unrecognized argument type: '+argType);
          }
        }
      ); 
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
  elName = _method.name + '-stream';
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
}
