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
