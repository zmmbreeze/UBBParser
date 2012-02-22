var UBBParser = function () {
    var Node = function( tag, content, attrs, parent, children ) {
        this.tag = tag;
        this.content = content;
        this.attrs = attrs;
        this.parent = parent;
        this.children = children;
    };
    Node.prototype.ubb = function () {
        return '';
    };
    Node.prototype.html = function () {
        return '';
    };
    var parse$Node = function( $node ) {
            var nodeName = $node[0].nodeName.toLowerCase(),
                re = {};
            switch( nodeName ) {
                case 'img':
                    re.content = $node.data('src');
                    // 处理图片
                    if ( !re.content ) {
                        re.content = $node.attr('src');
                        re.tag = 'image';
                    // 处理视频
                    } else {
                        re.tag = 'video';
                    }
                    break;
                case 'embed':
                    // 处理swf
                    break;
                case 'a':
                    // 处理a标签
                    re.tag = 'link';
                    re.attrs = {
                        href: $node.attr('hre');
                    };
                    re.content = $node.text();
                    break;
                case 'blockquote':
                    // 处理blockquote

                    break;
                default:
                    var isBold = $node.css('font-weight') === 'bold',
                        isItalic = $node.css('font-weight') === 'italic';
                    if ( isBold ) {
                        re.tag = 'bold';
                        re.content = $node.text();
                    } else if ( isItalic ) {
                        re.tag = 'italic';
                        re.content = $node.text();
                    } else {
                        re.isText = true;
                        re.content = $node.text();
                    }
                    break;
            }
            return re;
        },
        parseHtml = function( $node ) {
            var $children = node.contents()
                node = parse$Node( $node, $children ),
                children = [],
                l = $children.length;
            for( var i=0; i<l; i++ ) {
                children.push( parseHtml( $children.eq(i) ); );
            }
            node.children = children;
            return node;
        },
        rendHtml = function( node ) {
            
        },
        parseUbb = function( ubb ) {
            
        },
        rendUbb = function( node ) {

        };
/*
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
*/
}();
