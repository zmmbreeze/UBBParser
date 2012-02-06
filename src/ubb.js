window.UBBParser = function () {

    // extend
    function extend ( Super, Son ) {
        for (var method in Super.prototype) {
            Son.prototype[method] = Super.prototype[method];
        }
    }

    function format ( array ) {
        var args = '',
            tmp;
        for ( var i=0,l=array.length; i<l; i++ ) {
            tmp = array[i];
            args = ' ' + tmp.key + '=' + tmp['key'];
        }
    }

    function Tag() {
    }
    Tag.prototype = {
        //name: '',                 // 标签名字
        //parent: null,             // 父标签
        //arguments: null,          // [{key:value}] 或者 value(此时为默认值，例如：[color=#FFF][/color])
        //text: '',                 // 标签里面的内容
        needsEnd: true,             // 是否有end标签
        // 是否自动补全标签
        isAutoClose: function () {
            return true;    
        },
        // 验证标签
        validate: function() {
            return true;
        },
        content: function() {
            return this.text;
        },
        open: function() {
            return '';
        },
        close: function() {
            return '';
        },
        toString: function() {
            return ['[',
                    this.name,
                    typeof this.arguments === 'string' ?
                            '='+this.arguments :
                            format( this.arguments ),
                    ']',
                    this.content,
                    '[/',
                    this.name,
                    ']'].join('');
        }
    }

    function BoldTag() {
        
    }

    return function ( setting ) {
        this.setting = setting;
        this.parser = function ( ubb ) {
            
        };
        this.validate = function( ubb ) {
            
        };
    };
}();
