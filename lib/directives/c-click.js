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
