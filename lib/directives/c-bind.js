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
