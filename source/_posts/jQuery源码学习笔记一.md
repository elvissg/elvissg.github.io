---
title: jQuery源码学习笔记一
date: 2017-01-16 06:27:27
tags: Javascript
---
> 版本是[1.12-stable](https://github.com/jquery/jquery/blob/1.12-stable)

**入口:src/jquery.js**
源码:

	define( [
		"./core",
		"./selector",
		...
		"./exports/amd"
	], function( jQuery ) {
	
	return ( window.jQuery = window.$ = jQuery );
	
	} );

- jquery-1.12-stable遵循AMD，使用了requirejs库
- define()包含所有依赖的模块
- 最后将jQuery对象暴露到全局，并取了个别名叫$。

---
**core.js **
core.js先定义了jQuery对象

    var jQuery = function( selector, context ) {

        // The jQuery object is actually just the init constructor 'enhanced'
        // Need init if jQuery is called (just allow error to be thrown if not included)
													        return new jQuery.fn.init( selector, context );
    }

我们平时用的比如$("div")，实际上是jQuery("div")即**new  jQuery.fn.init("div")**。
jQuery.fn.init定义在src/core/init.js中，源码如下：


	init = jQuery.fn.init = function( selector, context, root ) {
		...
		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			    ...
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
			        ...
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
                            ...
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					...
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			//find定义在selector-sizzle.js中，jQuery.find = Sizzle
			} else {
				return this.constructor( context ).find( selector );//交给sizzle处理
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

可以看到 jQuery.fn.init函数处理各种传入$()里的参数。分一下6种情况：
1. ""、null、undefined、false
2. DOM元素
3. 字符串：HTML标签、HTML字符串、#id、选择器表达式
4. 函数（作为ready回调函数）
5. jQuery对象（因为有selector值）
6. 其它(sizzle)

---
下面定义jQuery原型

    jQuery.fn = jQuery.prototype = {
        ...
        constructor: jQuery,
        ...
    }
**这里为什么要将consructor定义为jQuery呢？**

在不重写prototype的情况下,constructor指向对象本身，比如：

	obj = new Object()
	a = new obj()  
	//a.constructor === obj is true
	
新定义Prototype对象的话，该Prototype对象原有的constructor属性会丢失
即

	obj = new Object
	obj.prototype = {getName:function(){}}
	a = new obj()
	//a.constructor === obj is false
	//a.rototype.constructor === Object is true
	//a.prototype.constructor === Object is true
	
于是通过将constructor显式的指向jQuery解决这个问题	

---
之后定义了*extend*方法(这个方法平时见的比较多，写jquery插件都要用上)：

	jQuery.extend = jQuery.fn.extend = function() {
        //extend的作用是复制数组，通过第一个参数控制深复制(true)和浅复制
	  var src, copyIsArray, copy, name, options, clone,
	  target = arguments[0] || {},
	  i = 1,
	  length = arguments.length,
	  deep = false;
	
	// 深拷贝
	if ( typeof target === "boolean" ) {
	  deep = target;
	
	// 跳过boolean值
	target = arguments[ i ] || {};
	i++;
	}
	
	
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
	  target = {};
	}
	
	// 只有一个参数时，表示扩展jQeury对象本身
	if ( i === length ) {
	  target = this;
	  i--;
	}
	
	for ( ; i < length; i++ ) {
	// 跳过null参数
	if ( (options = arguments[ i ]) != null ) {
	  // 扩展对象
	  for ( name in options ) {
	    src = target[ name ];
	    copy = options[ name ];
	
	    // 防止死循环
	    if ( target === copy ) {
	      continue;
	    }
	
	    // 递归复制
	    if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
	      if ( copyIsArray ) {
	        copyIsArray = false;
	        clone = src && jQuery.isArray(src) ? src : [];
	
	      } else {
	        clone = src && jQuery.isPlainObject(src) ? src : {};
	      }
	
	      // Never move original objects, clone them
	      target[ name ] = jQuery.extend( deep, clone, copy );
	
	    // Don't bring in undefined values
	  } else if ( copy !== undefined ) {
	    target[ name ] = copy;
	  }
	}
	}
	}
	
	// Return the modified object
	return target;
	};
之后core.js通过jQuery.extend扩展了一些静态方法


	jQuery.extend( {
		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),
	
		// Assume jQuery is ready without the ready module
		isReady: true,
		...
		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},
	
		isPlainObject: function( obj ) {
			var key;
	
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}
			...
	});

---
core.js就做了以上的事，接着是selector.js 
selector.js指向了*selector-sizzle.js*，*selector-sizzle.js*又指向了*../external/sizzle/dist/sizzle*。
sizzle是jquery的选择器引擎，从1.3被分离出来。sizzle采用Right To Left的查询匹配方式，效率较高。这里先略过，以后再看sizzle源码。
