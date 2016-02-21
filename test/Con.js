(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var con = require('./lib/api');
global.con = con;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/api":2}],2:[function(require,module,exports){
var Context = require('./context'),
	utils = require('./utils');

function Core(el){
	this.el = el;
	this._providers = {};
	this.context = Core.$globalCtx.$new();
}

Core.$globalCtx = new Context();

Core.prototype.init = function(){
	this.compile(this.el, this.context);

	return this;
}

/*
* const varible
*/
var DIRECTIVES_SUFFIX = 'Directive',
	CONTROLLERS_SUFFIX = 'Controller';

Core.prototype.get = function(name){
	return this._providers[name] || false;
}


Core.prototype._register = function(name, action){
	this._providers[name] = action;
}

Core.prototype.directive = function(name, fn){
	this._register(name + DIRECTIVES_SUFFIX, fn)
}

Core.prototype.controller = function(name, fn){
	this._register(name + CONTROLLERS_SUFFIX, fn)
}

Core.prototype.action = function(name, fn){
	this._register(name, fn);
}

Core.prototype.context = function(obj){
	if(obj){
		utils.extends(this.context, obj);
	}else{
		return this.context;
	}
}


Core.prototype.compile = function(el, context){
	var self = this;
	var currentCtx = context;
	utils.map(el.attributes || [], function(attr){
		var directive = self.get(attr.name + DIRECTIVES_SUFFIX);

		return directive && {
			exp: attr.value,
			_directive: directive()
		};
	})
	.filter(Boolean)
	.forEach(function(d){
		if(d._directive.context == true){
			currentCtx = context.$new();
			d._directive.method(el, currentCtx, d.exp);
		}else{
			d._directive.method(el, context, d.exp);			
		}
	});
	utils.each(el.children || [], function(d){
		self.compile(d, currentCtx);
	})

}

/*
* 模板解析
*/

Core.prototype.parseText = function(text, data){
	return utils.parseParenthesis(text, data);
}

/*
* 插件机制
*/

Core.prototype.use = function(fn){
	fn(this);
}

module.exports = function(el){
	var app = new Core(el);

	app.use(function(app){
		require('./directives/c-model')(app);
	});
	app.use(function(app){
		require('./directives/c-bind')(app);
	});
	app.use(function(app){
		require('./directives/c-click')(app);
	});
	app.use(function(app){
		require('./directives/c-controller')(app);
	});
	app.use(function(app){
		require('./directives/c-repeat')(app);
	});

	return app;
}


},{"./context":3,"./directives/c-bind":4,"./directives/c-click":5,"./directives/c-controller":6,"./directives/c-model":7,"./directives/c-repeat":8,"./utils":9}],3:[function(require,module,exports){
var utils = require('./utils');

function Context(parent, id){
	this._watchers = [];
	this._children = [];
	this._parent = parent;
	this._id = id || 0;
}

Context.counter = 0;

/*
* context set and get
*/
Context.prototype.$set = function(exp, value){
	if(exp){
		this[exp] = value;
	}else{
		//throw Error("Wrong params of Content.$set.");
	}

	return this;
}

Context.prototype.$get = function(exp){
	if(exp){
		if(this[exp]){
			return this[exp];			
		}else if(this.parent){
			return this.parent.$get(exp);
		}else{
			return null;
		}
	}else{
		return null;
	}
}

/*
* params: object
* params: exp
* params: exp value
*/

Context.prototype.$data = function(){
	if(arguments.length == 1 && typeof arguments[0] == 'object'){
		var obj = arguments[0];
		for(var key in obj){
			this.$set(key, obj[key]);
		}
	}else if(arguments.length == 1 && typeof arguments[0] == 'string'){
		return this.$get(arguments[0]);
	}else if(arguments.length == 2){
		this.$set(arguments[0], arguments[1]);
	}else{
		//throw Error('Wrong params of Content.$data!');
	}

	return this;
}

Context.prototype.$watch = function(exp, fn){
	this._watchers.push({
		exp: exp,
		fn: fn,
		last: utils.clone(this.$eval(exp))
	});
};

/*
* params: 'function', 'method()', 'attr'
*/
Context.prototype.$eval = function(exp){
	var val;
	if(typeof exp === 'function'){
		val = exp.call(this);
	}else{
		if((/\(\)$/).test(exp)){
			exp = exp.replace(/\(\)$/, '');
			if(typeof this.$get(exp) === 'function'){
				val = this.$get(exp)();
			}
		}else{
			val = this.$get(exp);
		}
	}
	return val;
}

Context.prototype.$new = function(parent){
	var _parent = parent || this._parent;
	Context.counter += 1;
	var newContext = new Context(_parent, Context.counter);
	this._children.push(newContext);

	return newContext;
}

Context.prototype.$destroy = function(){
	var tmp = this._parent._children;
	tmp.splice(tmp.indexOf(this), 1);
}

Context.prototype.$digest = function(){
	var dirty = false,
		watcher, 
		current,	//current value
		i;

	do{
		dirty = false;
		for(i = 0; i < this._watchers.length; i++){
			watcher = this._watchers[i];
			current = this.$eval(watcher.exp);

			if(!utils.equals(watcher.last, current)){
				watcher.last = utils.clone(current);
				dirty = true;
				watcher.fn(current);
			}
		}
	}while(dirty);
	for(i = 0; i < this._children.length; i++){
		this._children[i].$digest();
	}
}

module.exports = Context;


















},{"./utils":9}],4:[function(require,module,exports){
var c_bind = function(app) {
    app.directive('c-bind', function() {
        return {
            context: false,
            method: function(el, context, exp) {
                el.innerHTML = context.$eval(exp) || '';

                context.$watch(exp, function(val) {
                    el.innerHTML = val;
                })
            }
        }
    })
}


module.exports = c_bind;

},{}],5:[function(require,module,exports){
var c_click = function(app) {
    app.directive('c-click', function() {
        return {
            context: false,
            method: function(el, context, exp) {
                el.onclick = function() {
                    context.$eval(exp);
                    context.$digest();
                };
            }
        }
    })
}

module.exports = c_click;

},{}],6:[function(require,module,exports){
var c_controller = function(app) {
    app.directive('c-controller', function() {
        return {
            context: true,
            method: function(el, context, exp) {
            	console.log('controller ctx:', context);
                app.get(exp + 'Controller')(context);
            }
        }
    })
}

module.exports = c_controller;
},{}],7:[function(require,module,exports){
var c_model = function(app) {
    app.directive('c-model', function() {
        return {
            context: false,
            method: function(el, context, exp) {
                el.onkeyup = function() {
                    context.$set(exp, el.value);
                    context.$digest();
                };
                context.$watch(exp, function(val) {
                    console.log('c-model:', val);
                })
            }
        }
    })
}


module.exports = c_model;

},{}],8:[function(require,module,exports){
var c_repeat = function(app) {
    app.directive('c-repeat', function() {
        return {
            context: false,
            method: function(el, context, exp) {
                var _exp = exp.split('in'),
                    itemName = _exp[0].trim(),
                    itemsName = _exp[1].trim(),
                    parentNode = el.parentNode;

                function render(items) {
                    while (parentNode.firstChild) {
                        parentNode.removeChild(parentNode.firstChild);
                    }

                    if (Array.isArray(items)) {
                        items.forEach(function(item) {
                            var currentNode = el.cloneNode();
                            currentNode.removeAttribute('c-repeat');

                            currentNode.innerHTML = app.parseText(el.innerHTML, item);
                            parentNode.appendChild(currentNode);
                        })
                    }else{
                    	//to do
                    }
                }
                context.$watch(itemsName, render);
                render(context.$eval(itemsName));
            }
        }
    })
}


module.exports = c_repeat;

},{}],9:[function(require,module,exports){
var utils = {
    each: function(arr, fn) {
        [].forEach.call(arr, fn);
    },
    map: function(arr, fn) {
        return [].map.call(arr, fn);
    },
    equals: function(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    },
    clone: function(a) {
        try {
            return JSON.parse(JSON.stringify(a));
        } catch (e) {
            return undefined;
        }
    },
    /*双括号语法解析*/
    parseParenthesis: function(str, data) {
        data = data || {};
        var matches = str.trim().match(/\s*{{\s*(\w*\.*)*\s*}}\s*/g);
        console.log('matches:', matches);
        if (matches) {
            matches.forEach(function(m) {
                if (typeof data === 'object') {
                    var exp = m.trim().replace('{{', '').replace('}}', '').trim();
                    console.log(exp);
                    expArr = exp.split('.');
                    expArr.forEach(function(key) {
                        data = data[key];
                    })
                }
                str = str.replace(/\s*{{\s*(\w*\.*)*\s*}}\s*/, data);
                console.log(str);
            })
            return str;
        } else {
            return false;
        }
    },
    extends: function(out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    out[key] = arguments[i][key];
                }
            }
        }
        return out;
    },
    //dom selector
    dom: function(selector){
        if(selector.nodeType && (selector.nodeType == 1 || selector.nodeType == 9)){
            return selector;
        }else{
            return document.querySelector(selector);
        }
    }
};

module.exports = utils;

},{}]},{},[1]);
