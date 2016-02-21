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
            })
            if(str == 'undefined'){
                str = '';
            }
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
