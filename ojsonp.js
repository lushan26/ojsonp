/**
* An ordered-jsonp utility to ensure the order of multiple jsonps' execution.(FIFO)
* Usage: ojsonp(url,callback);
* If you want to debug, use
* ojsonp.config('onerror',function(err){
*   console.log(err);
* });
*/
var ojsonp = (function(){
  var index = 0;
  //functions
  var callbacks = [];
  var cursor = 0;
  var myName = 'ojsonp';
  var onerror = null;
  //all
  var tasks = [];
  var result = function(url,callback){
    var idx = index++;
    if(url.indexOf('?') === -1){
      url += '?';
    }else{
      url += '&';
    }
    url += 'callback='+encodeURIComponent(myName+'.callbacks['+idx+']');
    var script = document.createElement('script');
    var parentNode = document.getElementsByTagName('head')[0];
    parentNode.appendChild(script);
    var realCallback = callbacks[idx] = function(data){
      var me = arguments.callee;
      var taskIndex = me.__index__;
      tasks[taskIndex] = {
        callback: window[callback],
        data: data,
        index: idx,
        script: script
      };
      if(taskIndex > cursor){
        return;
      }else{
        while(tasks[taskIndex]){
          var item = tasks[taskIndex];
          //pass the data on to the original callback
          try{
            item.callback.call(window,item.data);
          }catch(e){
            item.error = e;
            if(onerror){
                onerror.call(window,e);    
            }
          }
          var js = item.script;
          if(js && js.parentNode){
            js.parentNode.removeChild(js);
          }
          taskIndex++;
        }
        cursor = taskIndex;
      }

    };
    realCallback.__index__ = idx;
    script.src = url;
  }
  result.tasks = tasks;
  result.callbacks = callbacks;
  result.config = function(key,value){
      switch(key){
        case 'onerror':
            onerror = value;
            break;  
        default: '';
      }
  };
  return result;
})();