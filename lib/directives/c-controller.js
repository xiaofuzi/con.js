var c_controller = function(app) {
    app.directive('c-controller', function() {
        return {
            context: true,
            method: function(el, context, exp) {
                app.get(exp + 'Controller')(context);
            }
        }
    })
}

module.exports = c_controller;