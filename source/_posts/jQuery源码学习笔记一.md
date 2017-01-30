---
title: jQuery源码学习笔记一
date: 2017-01-16 06:27:27
tags: Javascript
---
> 版本是[1.12-stable](https://github.com/jquery/jquery/blob/1.12-stable)
jquery-1.12-stable遵循AMD，使用了requirejs库，模块分的很清楚，比较好读

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

- define()包含所有依赖的模块
- 最后将jQuery对象暴露到全局，并取了个别名叫$。

---
**core.js **
core.js先定义了jQuery对象

    var jQuery = function( selector, context ) {
        return new jQuery.fn.init( selector, context );
    }

可以看出我们平时用的$()，比如$("div")，实际上是jQuery("div")，即**new jQuery.fn.init("div")**。

jQuery.fn.init定义在src/core/init.js中，源码如下：


	//英文的是自带的注释，已经比较清楚了
	init = jQuery.fn.init = function( selector, context, root ) {
		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			//匹配"<"开头 ">"结尾，因为标签不为空的时候中间肯定存在字符，所以长度大于3
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// match是一个匹配用的变量数组，长度为3，html字符串则第2个有值，id字符串则第3个有值，故这里html字符串第2个有值
				match = [ null, selector, null ];
			} 
			else {
				match = rquickExpr.exec( selector );
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

				return this;

			// HANDLE: $(#id)
			} else {
				elem = document.getElementById( match[2] );

				// 判断elem.parentNode，是为了黑莓4.6的取回的节点却不在document的特殊问题（#6963）
				if ( elem && elem.parentNode ) {
					// 判断getElementById返回结果，是否是id的值造成的。（IE和Opera下，name对getElementById也生效的问题）
					if ( elem.id !== match[2] ) {
						return rootjQuery.find( selector );
					}

					// 将结果注入jQuery对象中
					this.length = 1;
					this[0] = elem;
				}

				this.context = document;
				this.selector = selector;
				return this;

			}
		//context是("",null,undefined,false)的情况
		} else if ( !context || context.jquery ) {
			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			//find定义在selector-sizzle.js中，jQuery.find = Sizzle
			return ( context || root ).find( selector );
		} else {
			//即jQuery( context ). find( selector )
			return this.constructor( context ).find( selector );
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
5. jQuery对象
6. 其它(sizzle)

---
扩展jQuery对象原型

    jQuery.fn = jQuery.prototype = {
        ...
        constructor: jQuery,
        ...

		pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},
		...一些其他辅助方法
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
作用是扩展jQuery对象或者jQuery,prototype对象。

    jQuery.extend = jQuery.fn.extend = function() {
        //extend的作用是复制数组，通过第一个参数控制深复制(true)和浅复制
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // 深复制
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
sizzle是jquery的选择器引擎，从1.3被分离出来。sizzle采用Right To Left的查询匹配方式，效率较高。
