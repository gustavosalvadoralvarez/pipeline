
function processStream(_method) {
  var elName, elProps, elAttributes; 
  if (!utils){ 
    throw new Error("Missing dependency: \n\tutils.js");
    return
  }
  if (!Polymer){ 
    throw new Error("Missing dependency: \n\tPolymer");
    return
  }
  if (!_method.name){ 
    throw new Error("Must provide a method name");
    return
  }
  elName = _method.name + '-stream';
  elAttributes = { 
    'class': 'process-stream'
  };
  if (_method){ 
    elProps = {}; 
    elProps.stream = { 
      type: Object,
      notify: true
    };
    elProps.isProcStream = {
      type: Boolean,
      value: true
    };
    elProps.method = {
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
              if (elProps.return){ 
                throw new Error('Only one argument of type function allowed');
                return
              }
              elProps.returnValue = {
                type: String,
                reflectToAttribute: true,
                notify: true
              };
              elProps.func = {
                type: String,
                reflectToAttribute: true,
                notify: true
              };
              elProps[argName] = {
                type: Function,
                computed: '_fnArg(func, returnValue)'
              };
            break;
            case 'array': 
              elProps[argName] = {
                type: Array,
                notify: true,
                reflectToAttribute: true
              };
            break; 
            case 'string': 
              elProps[argName] = {
                type: String,
                notify: true,
                reflectToAttribute: true
              };
            break;
            case 'object': 
              elProps[argName] = {
                type: Object,
                notify: true,
                reflectToAttribute: true
              };
            break;
            case 'number': 
              elProps[argName] = {
                type: Number,
                notify: true,
                reflectToAttribute: true
              };
            break;
            default: 
              throw new Error('Unrecognized argument type: '+argType);
            return
          }
        }
      ); 
      elProps.args = {
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
    throw new Error('No method specified for process-stream');
    return
  }
  return Polymer({
    is: elName,
    properties: elProps,
    hostAttributes: elAttributes,
    _fnArg: function (func, returnValue){ 
      return function(arg0, arg1, arg2, arg3, arg4){
        if (func){
          return eval(func).apply(null, utils.asArray(arguments))
        } else if (returnValue){ 
          return eval(returnValue)
        }
      }
    },
    '<|':  function pipeIn(stream){ 
      var self;
      self = this; 
      self.stream = stream[self.method].apply(
        stream,
        self.args.map(
          function(arg){
            return self[arg];
          }
        )
      );
      return self.stream
    }, 
  });
}
