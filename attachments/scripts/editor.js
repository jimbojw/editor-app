/**
 * editor.js - powers the editor
 */
(function(document, window){

var
  
  // references
  forEach = Array.prototype.forEach,
  join = Array.prototype.join,
  parse = JSON.parse,
  slice = Array.prototype.slice,
  stringify = JSON.stringify,
  toString = Object.prototype.toString,
  
  /**
   * Global container for all editor functionality.
   */
  system = window.system = {
    
    /**
     * Console methods.
     */
    console: {
      
      log: function(){
        console.log.apply(console, arguments);
      },
      
      error: function(e) {
        if ('error' in console) {
          console.error.apply(console, arguments);
        } else {
          console.log.apply(console, arguments);
        }
      }
      
    },
    
    /**
     * Prefixed and encoded access to local storage.
     */
    storage: {
      native: localStorage,
      prefix: 'ed-',
      set: function(key, value) {
        system.storage.native.setItem(system.storage.prefix + key, stringify(value));
      },
      get: function(key) {
        return parse(system.storage.native.getItem(system.storage.prefix + key));
      }
    },
    
    /**
     * basic input and output
     */
    io: {
      
      /**
       * Ask for confirmation from user, then take one of two courses of action.
       */
      confirm: function(params) {
        if (confirm(params.message)) {
          if (params.yes) {
            params.yes(params);
          }
        } else {
          if (params.no) {
            params.no(params);
          }
        }
      }
      
    },
    
    /**
     * running code
     */
    runtime: {
      
      /**
       * executes the provided code by injecting it into the dom as a script tag
       */
      exec: function(code, callback) {
        
        var
          script = document.createElement('script'),
          error,
          onerror = function(e){
            e.preventDefault();
            error = e;
          };
        
        script.textContent = code;
        window.addEventListener('error', onerror, false);
        document.body.appendChild(script);
        document.body.removeChild(script);
        script = undefined;
        window.removeEventListener('error', onerror, false);
        
        if (error) {
          system.error = error;
          system.console.error(error);
        }
        if (callback) {
          callback(error);
        }
        
      }
      
    }
    
    
  };

})(document, window);
