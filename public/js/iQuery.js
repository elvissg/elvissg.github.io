;(function(root, factory, document, window) {
  var iQuery = factory(root);
  if (typeof define === 'function' && define.amd) {
    // AMD
    define('iQuery', function() {
      return iQuery;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = iQuery;
  } else {
    // Browser globals
    root.iQuery = root.$ = iQuery;
  }
}(this, function(root) {

  "use strict";
  var undefined;
  var class2type = {};
  var _iQuery = window.iQuery;
  var _$ = window.$;

  var iQuery = function(selector) {
    return new iQuery.fn.init(selector);
  }

  iQuery.fn = iQuery.prototype = {
    constructor: iQuery,

    init: function(selector) {
      if(!selector) return this;

      // Handle $(DOMElement)
      else if ( selector.nodeType ) {
        this[0] = selector;
        this.length = 1;
        return this;
      }

      //$(function)
      else if(iQuery.type(selector) === 'function'){
        return iQuery(document).ready(selector)
      }

      else if(selector.toLowerCase === 'document') {
        return document
      }

      else if(selector instanceof iQuery){
        return this.dom
      }
      else {
        this.dom = document.querySelectorAll(selector);
        return this
      }
    }

  }

  iQuery.fn.init.prototype = iQuery.fn;


  iQuery.extend = iQuery.fn.extend = function() {
    var target = arguments[0] || {};
    var arrs = Array.prototype.slice.call(arguments, 0);//slice将带有length属性的对象转换为数组
    var len = arrs.length;
    if ( len === 1 ) {
      var target = this;
    }

    for (var i = 0; i < len; i++) {
      var arr = arrs[i];
      for (var name in arr) {
        target[name] = arr[name];
      }
    }
    return target;
  }

  //扩展核心方法$.fn
  iQuery.extend({
    noConflict: function( deep ) {
      if ( window.$ === iQuery ) {
        window.$ = _$;
      }
      if ( deep && window.iQuery === iQuery ) {
        window.iQuery = _iQuery;
      }
      return iQuery;
    },

    isWindow: function( obj ) {
      //判断是window，因为window == window.window == window.window.window...
      return obj != null && obj === obj.window;
    },

    type: function( obj ) {
      if ( obj == null ) {
        return obj + "";
      }
      return typeof obj === "object" || typeof obj === "function" ?
        class2type[ Object.prototype.toString.call( obj ) ] || "object" :
        typeof obj;
    },

    each: function(obj, callback) {
      var length, i = 0;
      if (isArrayLike( obj )) {
        length = obj.length;
        for ( ; i < length; i++ ) {
          if ( callback.call( obj[ i ], obj[ i ] ) === false ) {
            break;
          }
        }
      } else {
        for ( i in obj ) {
          if ( callback.call( obj[ i ], obj[ i ] ) === false ) {
            break;
          }
        }
      }

      return obj;
    },

    ready: function (fn) {
      if (this.readyState != 'loading'){
        fn();
      } else {
        this.addEventListener('DOMContentLoaded', fn);
      }
      return this
    }
  })

  //扩展实例化方法$().fn
  iQuery.fn.extend({
    ready: function (fn) {
      iQuery.ready(fn)
      return this
    },

    addClass: function(className){
      this.dom.forEach(
        function(el){
          if(el.classList)
            el.classList.add(className);
          else
            el.className += ' ' + className;
          return this
        }
      )
    },

    hasClass: function(className){
      if (this.dom.classList)
        return this.dom.classList.contains(className);
      else
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.dom.className);
    },

    removeClass: function(className){
      if (this.dom.classList)
        this.dom.classList.remove(className);
      else
        className = className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      return this;
    },

    text: function() {
      return this.dom.innerText;
    },

    forEach: function(callback) {
      this.dom.forEach(function(el){
        callback(el)
      })
      return this
    },

    css: function(prop, val) {
      this.dom.forEach(
        function(el){
          el.style.setProperty(prop, val)
        }
      )
      return this;
    },
    show: function() {
      this.dom.forEach(function(el){
        el.style.setProperty('visibility', 'visible')
      })
    },

    hidden: function() {
      this.dom.forEach(function(el){
        el.style.setProperty('visibility', 'hidden')
      })
    },
    click: function(callback){
      this.dom.forEach(function(el){
        el.addEventListener('click', callback)
      })
    },
    mousemove: function(callback){
      
    }
  })


  iQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
    function( name ) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    } );

	function isArrayLike( obj ) {

		// Support: iOS 8.2 (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = iQuery.type( obj );

		if ( type === "function" || iQuery.isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}

  return iQuery;
}, document, window)
)
