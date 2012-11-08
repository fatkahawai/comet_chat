/**
* @author Bob Drummond
* 
* DEBUG.JS
* 
* @version 1.0
* @see
* @throws none
* 
* INTEGRATING THE MODULE 
* include <script src="js/utils/debug.js"></script> in your html file
* include "var debug = utils.debug;" in your .js file (or use utils.debug.trace() directly)
* 
* USE 
  utils.debug.trace(msg)   aka traceNormal() for normal tracing
  utils.debug.traceError(msg); to trace error msgs
  utils.debug.traceVerbose(msg); for detailed tracing you may want to disable 
  utils.debug.setLevel(level);
  utils.debug.setLevelVerbose();
  utils.debug.setLevelNormal();
  utils.debug.setLevelError();
  utils.debug.setLevelOff();
  utils.debug.traceArgs(msg);
  utils.debug.assert(expression, errortext);

* a module in com.pink-pelican.utils
* (c) 2012 Pink Pelican Ltd 
*/


// set up namespace as utils.debug
var utils;                  // this is my parent module
if (!utils){ 
  utils = {};     // if it wasn't already created by loading another module in utils, create a utils object
}
utils.debug = {};           // and create debug as an object in utils


// namespace envelope function to restrict scope of debug attributes 
// see at the end of the namespace function definition, where we export the public interface of the debug module
//
(function namespace() {

//"use strict"; //can't use strict mode else accessing function name and args will throw exception

// Attribute: the current log level - can be set using setLevel()
//
var _OFF = 0;
var _ERROR = 1;
var _NORMAL = 2;
var _VERBOSE = 3;

var logLevel = _OFF;

var startTime;

/* 
 * _trace internal method.
 * @private
 * 
 * @param int logging level -  the message should be logged to the console if this is higher than the current logLevel 
 * @param string s -           the message to log
 * @param bool popup -         true if you want a modal alert popup instead of logging to the console
 *
 * @return void
 */
  function _trace(
                   level,   
                   s,
                   popup){
    var msg;
    
    if( level <= this.logLevel )
    {
      var t= new Date();
      timeStamp = sprintf("%02d:%02d:%02d.%03d", t.getHours(), t.getMinutes(), parseInt(t.getSeconds()/1000), t.getSeconds()%1000);
      msg = "[debug.trace@L"+level+" "+timeStamp+"] "+s;
      if(popup){ // if popup argument is present and not falsy 
         alert(msg);
      }
      else{
        console.log(msg);
      }
    }
  };
  
/* 
 * traceError public method. - trace at the Error log level
 *
 * @param string s -           the message to log
 * @param bool popup -         true if you want a modal alert popup instead of logging to the console
 *
 * @return void
  */
  function traceError( s,       
                    popup){  
    this._trace( _ERROR, s, popup );
  }; // traceError
  
/* 
 * trace public method. - trace at the COARSE log level
 *
 * @param string s -     the message to log
 * @param bool popup -   true if you want a modal alert popup instead of logging to the console
 *
 * @return void
 */
  function trace( s,       
                    popup){  
    this._trace( _NORMAL, s, popup );
  };
  
/* 
 * traceVerbose public method. - trace at the FINE log level
 *
 * @param string s -           the message to log
 * @param bool popup -         true if you want a modal alert popup instead of logging to the console
 *
 * @return void
  */
  function traceVerbose( s,       
                    popup){  
    this._trace( _VERBOSE, s, popup );
  }; // traceVerbose
  
/*
 * Method: traceArgs  -   log the function name and its arguments 
 *
 * @param args - true if you want the message to appear in an Alert() stopping the process
 */
  function  traceArgs( args ){    
    var arg, caller, n, r, fname;
    
    caller = this.traceArgs.caller;

    if( caller == null ) // then was called from top level
      caller="<main>";
    else{
      // caller will be a string containing the complete source code of the function that called trace
      // so we need to extract the function name from i.
      // there are several function declaration methods so consider them in turn
      // the function name will be the first keyword in the string that isn't "var" or "function"
      r = /[a-zA-Z0-9\$_]+/g;   // regexp matches any the potential function name in the string
      fname = r.exec(caller) ; // get the first word
      while(fname == "function" || fname == "var" ){   // check if its a keyword 
        fname = r.exec(caller); // and if so, go on to the next word
      }
      caller = fname.toString().split("\n");  // else that first word is the funtion name. but just in case, only take first line 

    }
    
    this.traceVerbose("[traceArg] "+caller+"() entry. "+ arguments.length +" arguments passed:");
        
    for( n= 0; n< arguments.length; n++ ){   
        arg = arguments[n];  
        this.traceVerbose("[traceArg] "+caller+"(): arg["+n+"]= ("+ typeof(arg) +") ["+arg + "]" );
    }
    
  };

/*
 * 
 * setLevel  Method - setter for logLevel attribute
 */
  function setLevel(level   // the new log level you want to set 
                        ){
    this.startTime = new Date().getTime(); // note the start time  
    
    if( level > _VERBOSE )
        this.logLevel = _VERBOSE;
    else
        this.logLevel = level;
    this.trace("debug.setLevel(): set new debug log level = "+level );
  };
  
/*
 * setLevelVerbose  Method - setter for logLevel attribute
 */
  function setLevelVerbose(){
        this.setLevel(_VERBOSE);
  };
  
/*
 * setLevelVerbose  Method - setter for logLevel attribute
 */
  function setLevelNormal(){
        this.setLevel(_NORMAL);
  };
  
/*
 * setLevelVerbose  Method - setter for logLevel attribute
 */
  function setLevelError(){
        this.setLevel(_ERROR);
  };
  
/*
 * setLevelVerbose  Method - setter for logLevel attribute
 */
  function setLevelOff(){
        this.setLevel(_OFF);
  };
  
/*
 * assert - Method.
 * 
 * @param bool expression
 * @return true if expression is true. else debug trace to console and throw exception
 * 
 */  
  function assert( expression, errorText ){
    if( expression ){
      return true;
    }
    else{
      var msg = "ASSERT FAILED: "+ errorText;
      this.traceError( msg, true );  // trace at error level
      throw msg;
    }
  };
  // Export module interface ************
  utils.debug._trace = _trace;
  utils.debug.trace = trace;
  utils.debug.traceNormal = trace;
  utils.debug.traceError = traceError;
  utils.debug.traceVerbose = traceVerbose;
  utils.debug.setLevel = setLevel;
  utils.debug.setLevelVerbose = setLevelVerbose;
  utils.debug.setLevelNormal = setLevelNormal;
  utils.debug.setLevelError = setLevelError;
  utils.debug.setLevelOff = setLevelOff;
  utils.debug.traceArgs = traceArgs;
  utils.debug.assert = assert;
  // ************************************

}()); // namespace termination
