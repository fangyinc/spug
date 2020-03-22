var canMeasureWater = function(x, y, z) {
    var min = 0
    var max = 0
    if(x < y){
      min = x
      max = y
    }else{
      min = y
      max = x
    }
    var result = min
    while(result != z){
     value =  (min + value ) % max 
    }
};