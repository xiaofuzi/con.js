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
