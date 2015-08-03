function dataStream(data) {
  var elConf, data, _; 
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
  elConf.is = 'data-stream';
  elConf.properties = {};
  elConf.properties.stream = { 
    type: Object,
    readOnly: true,
    value: function (){
      return _()
    }
  };
  elConf.properties.data = {
    type: Object,
    reflectToAttribute: true,
    observe: 'load'
  };
  if (data){
    if (typeof data === 'string'){
      try{
        data = JSON.parse(data); 
      } catch (e) { 
        throw new Error("Data must be valid JSON: \n\t"+data);
        return
      }
    }
    elConf.properties.data.value = function () {
      return data
    }
  } 
  elConf.load = function(data){
    var self;
    self = this;
    data = data || self.data;
    data.forEach(self.stream.write);
    self.fire('load', data); 
  };
  
  return Polymer(elConf); 
}