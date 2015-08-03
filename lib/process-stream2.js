function processStream(_method) {
  var _, elConf, procArgs; 
  if (!utils){ 
    throw new Error("Missing dependency: \n\tutils.js");
    return
  }
  if (!Polymer){ 
    throw new Error("Missing dependency: \n\tPolymer");
    return
  }
  if (!highland){
    throw new Error("Missing dependency: \n\thighland");
    return
  }
  _ = highland;
  elConf = {}; 
  elConf.is = _method.is;
  elConf.properties = {};
  elConf.properties.isProcStream = {
    type: Boolean,
    readOnly: true,
    value: true
  };
  if (_method){ 
    elCong.properties.method = {
      type: String,
      readOnly: true,
      value: _method.name
    };
    if (_method.arguments) { 
      var args = _method.arguments;
      args.forEach(
        function addToProps(arg){
          var argName, argType; 
          argName = arg.name;
          argType = arg.type;
          switch (artType){ 
            case 'function': 
              if (elConf.properties.return){ 
                throw new Error('Only one argument of type function allowed');
                return
              }
              elConf.properties.return = {
                type: String,
                reflectToAttribute: true,
                notify: true
              };
              elConf.properties.func = {
                type: String,
                reflectToAttribute: true,
                notify: true
              };
              elConf.properties[argName] = {
                type: function,
                readOnly: true,
                value: function(){
                  return function(arg0, arg1, arg2, arg3, arg4){
                    var self;
                    self = this;
                    if (self.func){
                      return eval(self.func).apply(null, utils.asArray(arguments));
                    } else if (self.return){ 
                      return eval(self.return);
                    }
                  }
                }
              };
            break;
            case 'array': 
              elConf.properties[argName] = {
                type: Array,
                notify: true,
                reflectToAttribute: true
              };
            break; 
            case 'string': 
              elConf.properties[argName] = {
                type: String,
                notify: true,
                reflectToAttribute: true
              };
            break;
            case 'object': 
              elConf.properties[argName] = {
                type: Object,
                notify: true,
                reflectToAttribute: true
              };
            break;
            case 'number': 
              elConf.properties[argName] = {
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
      procArgs = args.map(
        function(arg){
          return arg.name;
        }
      );
    } else { 
      procArgs = [];
    }
  } else {
    throw new Error('No method specified for process-stream');
    return
  }
  elConf.properties.args = {
    type: Array,
    readOnly: true,
    value: function() { 
      return procArgs
    }
  };
  elConf.properties.process = {
    computed: ('_process('+procArgs.toString()+')'),
    type: Object
  };
  elConf._process = function(args){ 
    var self;
    self = this; 

    return _[self.method].apply(_, utils.asArray(arguments))
  };
  return Polymer(elConf); 
}