var YAML = require('yamljs')
var fs = require("fs")
var path = require("path")
 
var yamldir = path.join(__dirname+'/yaml')
var pa = fs.readdirSync(yamldir)
var res = {}
pa.forEach(function(fn) {
  var fileName = yamldir+'/'+fn
  var result = YAML.load(fileName)
  if(result == null) {
    console.log("file error "+fileName)
  } else {
    nextObj(result,fn)
  }
  res[getName(fn)] = result
})
var f0 = process.argv[2]
var nRes = res[f0]

extendObj(nRes,res)

console.log(YAML.stringify(nRes,24,2))
//console.log(YAML.stringify(res,24,2))
function getName(fileName) {
  var indexF = fileName.lastIndexOf('.')
  return fileName.substring(0,indexF)
}

function nextObj(jobj,fn) {
  
  for(var key in jobj) {
    var v = jobj[key]
    if(key == '$ref') {
      //console.log("B: "+key+':'+jobj[key])
      var indexF = v.lastIndexOf('#')
      var len = v.length
      if(indexF==0) {
        jobj[key] = "#/"+getName(fn)+v.substring(indexF+1,len)
      } else if(indexF>0){
        var rFn = v.substring(0,indexF-1)
        jobj[key] = "#/"+getName(rFn)+v.substring(indexF+1,len)
      }
      //console.log("A: "+key+':'+jobj[key])
    } else if(v.length > 0 && typeof(v) == "object" || typeof(v) == "object") {
      nextObj(v,fn)
    }
  }
}

function extendObj(jobj,allyaml) {
  for(var key in jobj) {
    var v = jobj[key]
    if(v['$ref'] != null) {
      var ref = v['$ref']
      var rs = ref.substring(2,ref.length)
      var s = rs.split('/')
      // console.log(s)
      var robj = allyaml
      for(var ss in s) {
        // console.log(s[ss])
        robj = robj[s[ss]]
      }
      // console.log(robj)
      jobj[key] = robj
      extendObj(robj,allyaml)
    } else if(v.length > 0 && typeof(v) == "object" || typeof(v) == "object") {
      extendObj(v,allyaml)
    }
  }
}