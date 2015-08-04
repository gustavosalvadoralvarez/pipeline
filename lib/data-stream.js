function dataStream() {
  var elProps, data, _; 
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
  elProps = {};
  elProps.isDataStream ={
    type: Boolean,
    readOnly: true,
    value: true
  };
  elProps.stream = { 
    type: Object,
    readOnly: true,
    value: function (){
      return _()
    }
  };
  elProps.data = {
    type: Object,
    reflectToAttribute: true,
    observe: 'load'
  };

  return Polymer({
    is: 'data-stream', 
    properties: elProps,
    load: function(data){
      var self;
      self = this;
      if (data){
        if (typeof data === 'string'){
          try{
            data = JSON.parse(data); 
          } catch (e) { 
            throw new Error("Data must be valid JSON: \n\t"+data);
            return
          }
        }
        self.data = data;
      } 
      data.forEach(self.stream.write);
      self.fire('load', data); 
    }
  }); 
}