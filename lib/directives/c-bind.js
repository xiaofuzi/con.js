var c_bind = function(app) {
    app.directive('c-bind', function() {
        return {
            context: false,
            method: function(el, context, exp) {
                //var bindValue = context.$eval(exp) || '';
                //el.innerHTML = app.parseText(el.innerHTML, bindValue);
                el.innerHTML = context.$eval(exp);
                context.$watch(exp, function(val) {
                    //el.innerHTML = app.parseText(el.innerHTML, val);
                    el.innerHTML = val;
                })
            }
        }
    })
}


module.exports = c_bind;
