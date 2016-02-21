var utils = require('./utils');

function Context(parent, id) {
    this._watchers = [];
    this._children = [];
    this._parent = parent;
    this._id = id || 0;
}

Context.counter = 0;

/*
 * context set and get
 */
Context.prototype.$set = function(exp, value) {
    if (exp) {
        this[exp] = value;
    } else {
        //throw Error("Wrong params of Content.$set.");
    }

    return this;
}

Context.prototype.$get = function(exp) {
    if (exp) {
        /*
         * 判断是否有类型信息并做相应的处理
         */
        var type = null;
        if (exp.indexOf('::') !== -1) {
        	var tmp = exp.split('::');
            name = tmp[0];
            type = tmp[1];
            console.log('type:', tmp, name, type);
        }

        if (this[exp] !== undefined) {
            return this[exp];
        } else if (this._parent) {
            return this._parent.$get(exp);
        } else {
            return (type == 'number') ? 0 : '';
        }
    } else {
        return null;
    }
}

/*
 * params: object
 * params: exp
 * params: exp value
 */

Context.prototype.$data = function() {
    if (arguments.length == 1 && typeof arguments[0] == 'object') {
        var obj = arguments[0];
        for (var key in obj) {
            this.$set(key, obj[key]);
        }
    } else if (arguments.length == 1 && typeof arguments[0] == 'string') {
        return this.$get(arguments[0]);
    } else if (arguments.length == 2) {
        this.$set(arguments[0], arguments[1]);
    } else {
        //throw Error('Wrong params of Content.$data!');
    }

    return this;
}

Context.prototype.$watch = function(exp, fn) {
    this._watchers.push({
        exp: exp,
        fn: fn,
        last: utils.clone(this.$eval(exp))
    });
};

/*
 * params: 'function', 'method()', 'attr'
 */
Context.prototype.$eval = function(exp) {
    var val;
    if (typeof exp === 'function') {
        val = exp.call(this);
    } else {
        if ((/\(\)$/).test(exp)) {
            exp = exp.replace(/\(\)$/, '');
            if (typeof this.$get(exp) === 'function') {
                val = this.$get(exp)();
            }
        } else {
            val = this.$get(exp);
            console.log('this.$get(exp)', this.$get(exp));
        }
    }
    return val;
}

Context.prototype.$new = function(parent) {
    var _parent = this;
    Context.counter += 1;
    var newContext = new Context(_parent, Context.counter);
    this._children.push(newContext);
    return newContext;
}

Context.prototype.$destroy = function() {
    var tmp = this._parent._children;
    tmp.splice(tmp.indexOf(this), 1);
}

Context.prototype.$digest = function() {
    var dirty = false,
        watcher,
        current, //current value
        i;

    do {
        dirty = false;
        for (i = 0; i < this._watchers.length; i++) {
            watcher = this._watchers[i];
            current = this.$eval(watcher.exp);
            if (!utils.equals(watcher.last, current)) {
                watcher.last = utils.clone(current);
                dirty = true;
                watcher.fn(current);
            }
        }
    } while (dirty);
    for (i = 0; i < this._children.length; i++) {
        this._children[i].$digest();
    }
}

module.exports = Context;
