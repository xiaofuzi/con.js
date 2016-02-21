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
	return this;
}

module.exports = function(el){
	//dom selector
	el = utils.dom(el);

	var app = new Core(el);

	app.use(function(app){
		require('./directives/c-controller')(app);
	});
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
		require('./directives/c-repeat')(app);
	});

	return app;
}

