function Selector(params) {
    this.init(params);
}
Selector.prototype = {
    constructor: Selector,
    init: function(params) {
        var __object2__ = {};

        switch(__object2__.toString.call(params)) {
            case '[object Function]':
                this.funcinit(params);
                break;
            case '[object String]':
                var matchResult = /^<(.*)\/>$/.exec(params);
                if(matchResult === null) {
                    this.strinit(params);
                } else {
                    this.createElement(matchResult[1]);
                }
                break;
            default:
                break;
        }
    },
    funcinit: function(params) {
        window.onload = params;
    },
    strinit: function(params) {
        this.selector = params;
        this.context = document;
        var _this = this;

        function byClassName(className) {
            return document.getElementsByClassName(className);
        }

        function byId(id) {
            return document.getElementById(id);
        }

        function byTagName(tag) {
            return document.getElementsByTagName(tag);
        }

        function dealElements(eles) {
            if(eles.length !== 0) {
                for(var i = 0; i < eles.length; i++) {
                    _this[i] = eles[i];
                }
            }
            _this.length = eles.length;
        }

        if(params.indexOf('.') != -1) {
            dealElements(byClassName(params.substr(1)));
        } else if(params.indexOf('#') != -1) {
            dealElements([byId(params.substr(1))]);
        } else {
            dealElements(byTagName(params));
        }
    },
    createElement: function(params) {
        this.length = 1;
        this[0] = document.createElement(params);
        return this;
    },
    append: function(target) {
        var ele = this[0];
        ele.appendChild(target[0]);
        return this;
    },
    appendTo: function(target) {
        var ele = this[0];
        target[0].appendChild(ele);
        return this;
    },
    html: function(str) {
        var ele = this[0];
        ele.innerHTML = str;
        return this;
    },
    addClass: function(name) {
        var className = this.attr('class') || '';
        if(className.indexOf(name) == -1) {
            className = className + ' ' + name;
            this.attr('class', className);
        }
        return this;
    },
    removeClass: function(name) {
        var className = this.attr('class');
        if(className.indexOf(name) != -1) {
            this.attr('class', className.replace(name, ''));
        }
        return this;
    },
    attr: function(name, value) {
        var ele = this[0];
        var attrValue = ele.getAttribute(name);
        if(value) {
            ele.setAttribute(name, value);
            return this;
        }
        return attrValue;
    },
    css: function(cssObj) {
        var style = this.attr('style') || '';
        function append(str, arr) {
            if(str[str.length - 1] == ';') {
                str = str + ';';
            }
            return str + arr[0] + ':' + arr[1] + ';';
        }
        function replace(str, arr) {
            var reg = new RegExp('^(.*' + arr[0] + '[^:]*:)([^;]*)(;.*)?$', 'g');
            return str.replace(reg, '$1' + arr[1] + '$3');
        }
        if(cssObj) {
            for(var param in cssObj) {
                if(style.indexOf(param) == -1) {
                    style = append(style, [param, cssObj[param]]);
                } else {
                    style = replace(style, [param, cssObj[param]]);
                }
            }
            this.attr('style', style);
            return this;
        } else {
            return style;
        }
    },
    height: function(num) {
        num = Number(num) ? num : 0;
        this.css({'height': num + 'px'});
    },
    width: function(num) {
        num = Number(num) ? num : 0;
        this.css({'width': num + 'px'});
    }
};

$ = function(params) {
    return new Selector(params);
}