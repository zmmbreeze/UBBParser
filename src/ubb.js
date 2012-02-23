var UBBParser = function () {
    /**
     * 中间格式node节点的格式
     */
    function Node() {
        this.tagName = null;        // 标签名
        this.value = null;          // 值
        this._attrs = null;         // 属性map;
        this._parent = null;        // 父节点
        this._children = null;      // 子节点数组;
    };
    Node.prototype.attr = function( key, value ) {
        if ( typeof value !== 'undefined' ) {
            this._attrs[key] = value;
            return this;
        } else {
            return this._attrs[key];
        }
    };
    Node.prototype.parent = function() {
        return this._parent;
    };
    Node.prototype.children = function() {
        // clone一个新的数组，避免对原子节点数组的修改
        return this._children.slice();
    };
    /**
     * 将指定的节点添加为当前节点的最后一个子节点
     * @param {object} node 被指定的节点
     */
    Node.prototype.append = function( node ) {
        this._children = this._children || [];
        node._parent = this;
        this._children.push( node );
    };
    /**
     * 将指定的节点插入到当前节点子节点中的指定位置
     * @param {object} node 节点
     * @param {number} offset 位置
     * @param {object} 当前节点
     */
    Node.prototype.insertChild = function( node, offset ) {
        this._children = this._children || [];
        if ( offset < 0 || this._children.length > offset ) {
            throw 'InsertChild: Offset is out of range!';
        }
        this._children.splice( offset, 0, node );
        return this;
    };
    /**
     * 把当前节点作为指定节点的最后一个子元素，并将指定节点插入到当前节点的原位置
     * @param {object} node 节点
     */
    Node.prototype.wrap = function( node ) {
        var oldParent = this._parent;
        if ( oldParent ) {
            var oldIndex = this.getIndex();
            this.detach();
            node.append( this );
            this.oldParent.insertChild( node, oldIndex );
        }
        return this;
    };
    /**
     * 将当前的节点插入到指定节点的后面
     * @param {object} node 节点
     * @param {object} 当前节点
     */
    Node.prototype.insertAfter = function( node ) {
        if ( this._parent ) {
            throw 'InsertAfter: Node has a parent!';
        }
        if ( !node._parent ) {
            throw 'InsertAfter: Target node has no _parent';
        }
        node._parent.insertChild( node, node.getIndex()+1 );
        return this;
    };
    /**
     * 将当前的节点插入到指定节点的前面
     * @param {object} node 节点
     * @param {object} 当前节点
     */
    Node.prototype.insertBefore = function( node ) {
        if ( this._parent ) {
            throw 'InsertBefore: Node has a parent!';
        }
        if ( !node._parent ) {
            throw 'InsertBefore: Target node has no parent';
        }
        node._parent.insertChild( node, node.getIndex() );
        return this;
    };
    /**
     * 将当前节点从父节点中移除
     */
    Node.prototype.detach = function() {
        var index = this.getIndex();
        if ( !~index ) {
            return;
        }
        this._parent._children.splice( index, 1 );
        this._parent = null;
    };
    /**
     * 获取当前节点在父节点中的排位
     * @param {number} 排位,如果没有父节点则返回-1
     */
    Node.prototype.getIndex = function() {
        if ( !this._parent ) {
            return -1;
        }
        return this._parent.indexOf(this);
    };
    /**
     * 获取指定字节点在当前节点子节点中的排位
     * @param {object} node 指定节点
     * @return {number} 排位,不是其子节点则返回-1
     */
    Node.prototype.indexOf = function( node ) {
        if ( !this._children ) {
            return -1;
        }
        if ( this._children.indexOf ) {
            return this._children.indexOf( node );
        } else {
            for ( var i=0,l=this._children.length; i<l; i++ ) {
                if ( this._children[i] === node ) {
                    return this._children[i];
                }
            }
        }
    };
    /**
     * 返回同一个深度中的前一个节点
     * @param {object} 节点
     */
    Node.prototype.prev = function() {
        var prev = this.getIndex() - 1;
        if ( prev >= 0 ) {
            return this._parent._children[ prev ];
        }
    };
    /**
     * 返回同一个深度中的前一个节点
     * @param {object} 节点
     */
    Node.prototype.next = function() {
        var index = this.getIndex(),
            next = index + 1;
        if ( ~index && next < this._children.length ) {
            return this._parent._children[ next ];
        }
    };
    /**
     * 返回当前节点的最后一个子节点
     * @return {object} 子节点
     */
    Node.prototype.lastChild = function() {
        return this._children && this._children[this._children.length-1];
    };
    /**
     * 返回当前节点的第一个子节点
     * @return {object} 子节点
     */
    Node.prototype.firstChild = function() {
        return this._children && this._children[0];
    };
    var Util = {
            /**
             * 判断一个样式是否为bold
             */
            isBold = function( fontWeight ) {
                var number = parseInt( fontWeight );
                if( isNaN(number) ) {
                    return /^(bold|bolder)$/.test( fontWeight );
                } else {
                    return number > 400;
                }
            },
            /**
             * 判断一个样式是否为bold
             */
            isItalic = function( fontStyle ) {
                return /^(italic|oblique)$/.test( fontWeight );
            },
            /**
             * 判断是否是一个有序列表
             */
            isOrderedList = function( listStyleType ) {
                return listStyleType !== 'none' && !this.isUnOrderedList( listStyleType );
            },
            /**
             * 判断是否是一个无序列表
             */
            isUnOrderedList = function( listStyleType ) {
                return /^(disc|circle|square)$/.test( listStyleType );
            },
            /**
             * 解析list，ul、ol或者是其他list-style符合的元素
             * @param {object} $node 节点
             * @param {object} re 对象
             */
            parseListNode = function( $node, re, parentNode ) {
                var listStyleType = $node.css('list-style-type');
                if ( listStyleType === 'none' ) {
                    return;
                }
                var listType = this.isUnOrderedList( listStyleType ) ? 'ul' :'li';
                re.tagName = 'li';
                // 如果有父元素，且为ul/ol
                if ( parentNode && /^(ul|ol)$/.test( parentNode.tagName ) ) {
                    // 如果父元素的listType与li的listType相同，则略过，即默认添加
                    if ( parentNode.tagName === listType ) {
                        return;
                    // 如果不同则重新生成一个ul/ol
                    } else {
                        var n = new Node();
                        n.tagName = listType;
                        n.insertAfter( parentNode );
                        return n;
                    }

                // 如果没有父元素为ul/ol
                } else {
                    var n = new Node();
                    n.tagName = listType;
                    re.wrap( n );
                }
            },
            /**
             * http://jsfiddle.net/zmmbreeze/wmnVp/
             * 处理换行、空格、&nbsp;
             * 不处理自动换行
             * @param {object} $node 节点
             * @param {object} re 对象
             */
            parseTextNode = function( $node, re ) {
                re.tagName = '#text';
                var text = $node.text();
                if ( !text ) {
                    re.value = '';
                    return;
                }
                var $container = $node.parent(),
                    whiteSpace = $container.css('white-space');
                switch( whiteSpace ) {
                    case 'normal':
                        text = $.trim(text).replace('\n',' ')
                                           .replace(/\s{2,}/g,' ');
                        break;
                    case 'pre':
                        break;
                    case 'nowrap':
                        text = $.trim(text).replace('\n',' ')
                                           .replace(/\s{2,}/g,' ');
                        break;
                    case 'pre-line':
                        text = text.replace('\n',' ')
                                   .replace(/\s{2,}/g,' ');
                        break;
                    case 'pre-wrap':
                        break;
                    default:
                        break;
                }
                re.value = text.replace( '\xa0', ' ' );

                // inline 样式在这里处理
                if ( Util.isBold( $container.css('font-weight') ) ) {
                    var n = new Node();
                    n.tagName = 'bold';
                    re.wrap( n );
                }
                if ( Util.isItalic( $container.css('font-style') ) ) {
                    var n = new Node();
                    n.tagName = 'italic';
                    re.wrap( n );
                }
            }
        },
        /**
         * 解析单个jquery object为Node 对象
         * @param {object} $node jquery object
         * @param {object} currentNode 当前解析完成的节点(即父节点)
         * @param {object} 解析完成的节点
         */
        parse$Node = function( $node, currentNode ) {
            var tmp,
                re = new Node(), 
                node = $node[0],
                nodeName = node.nodeName.toLowerCase(),
                nodeType = node.nodeType,
                display = $node.css('display');
            switch( nodeName ) {
                case 'img':
                    re.value = $node.data('src');
                    // 处理图片
                    if ( !re.value ) {
                        re.value = $node.attr('src');
                        re.tagName = 'image';
                    // 处理视频
                    } else {
                        re.tagName = 'video';
                    }
                    break;
                case 'embed':
                    // 处理swf
                    // 此处跳过
                    break;
                case 'a':
                    // 处理a标签
                    re.tagName = 'link';
                    re.attr( 'href', $node.attr('href') );
                    break;
                case 'blockquote':
                    // 处理blockquote
                    re.tagName = 'blockquote';
                    break;
                case 'ul':
                    re.tagName = 'ul';
                    break;
                case 'ol':
                    re.tagName = 'li';
                    break;
                case '#text':
                    // 处理文本节点
                    parseTextNode( $node, re );
                default:
                    break;
            }
            if( display === 'list-item' ) {
                // 重新定位到另一个新生成的父节点
                Util.parseListNode( $node, re, currentNode );
            }
            // 用户设置第三方的标签
            // filter( $node, re );
            return re;
        },
        /**
         * 解析jquery object（树）为Node 对象
         * @param {object} $node jquery object
         * @param {object} currentNode 当前解析完成的节点(即父节点)
         * @param {object} 解析完成的节点
         */
        parseHtml = function( $node, currentNode ) {
            if ( $node.length !== 1 ) {
                throw 'ParseHtml: $node must only contains one element!';
            }
            var $children = node.contents()
                node = parse$Node( $node, currentNode ),
                l = $children.length;
            for( var i=0; i<l; i++ ) {
                node.append( parseHtml( $children.eq(i), node ) );
            }
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
*/

    return function ( setting ) {
        this.setting = setting;
        this.HTMLtoUBB = function ( ubb ) {
            
        };
        this.UBBtoHTML = function( ubb ) {

        };
    };
}();
