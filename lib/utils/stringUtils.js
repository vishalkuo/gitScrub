strUtils = module.exports
strUtils.rTrim = function(line, index){
    return line.substring(index).replace(/\s+$/,"")
}