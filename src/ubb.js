var UBBParser = (function () {
    if ( !Object.create ) {
        Object.create = function (o) {
            if (arguments.length > 1) {
                throw new Error('Object.create implementation only accepts the first parameter.');
            }
            function F() {}
            F.prototype = o;
            return new F();
        };
    }
    /**
     * 中间格式node节点的格式
     */
    function Node() {
        /*
        this.tagName = null;        // 标签名
        this.value = null;          // 值
        this._attrs = null;         // 属性map;
        this._parent = null;        // 父节点
        this._children = null;      // 子节点数组;
        */
    };
    Node.prototype.attr = function( key, value ) {
        this._attrs = this._attrs || {};
        if ( typeof value !== 'undefined' ) {
            this._attrs[key] = value;
            return this;
        } else {
            return this._attrs[key];
        }
    };
    Node.prototype.eachAttr = function( iterator, context ) {
        for(var key in this._attrs) {
            if( this._attrs.hasOwnProperty( key ) ) {
                iterator.call( context, this._attrs[key], key, this._attrs );
            }
        }
        return this;
    };
    Node.prototype.parent = function() {
        return this._parent;
    };
    Node.prototype.children = function() {
        // clone一个新的数组，避免对原子节点数组的修改
        return this._children
                ? this._children.slice()
                : [];
    };
    /**
     * 将指定的节点添加为当前节点的最后一个子节点
     * @param {object} node 被指定的节点
     */
    Node.prototype.append = function( node ) {
        if( node._parent ) {
            throw 'Append: node has parent，can‘t be appended again!';
        }
        this._children = this._children || [];
        node._parent = this;
        this._children.push( node );
        return this;
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
     */
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
     * 将当前节点的所有子节点移除
     */
    Node.prototype.detachChildren = function() {
        var children = this.children(),
            i = 0,
            l = children.length;
        if ( children.length ) {
            for( ; i<l; i++ ) {
                children[i].detach();
            }
        }
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
     * 获取指定子节点在当前节点子节点中的排位
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
            return -1;
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
     * 返回同一个深度中的下一个节点
     * @param {object} 节点
     */
    Node.prototype.next = function() {
        var index = this.getIndex(),
            next = index + 1;
        if ( ~index && next < this._parent._children.length ) {
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
    /**
     * 查找当前节点的祖先元素是否是指定的标签
     * @param {array/string} tagNames
     * @param {boolean} includeSelf 当前是否也需要判断
     * @return {object} 最先找到的符合的节点,没有找到则为空
     */
    Node.prototype.findAncestorByTagName = function( tagNames, includeSelf ) {
        var node = includeSelf ? this : this._parent;
        tagNames = typeof tagNames === 'string' ? [tagNames] : tagNames;
        while( node ) {
            if( ~$.inArray( node.tagName, tagNames ) ) {
                return node;
            }
            node = node._parent;
        }
    };
    /**
     * 克隆节点，如果是深度克隆则会拷贝上下节点的关系，即拷贝子节点！(注意循环引用)
     * @param {boolean} deep 是否是深度克隆
     * @return {object} 克隆得到的节点
     */
    Node.prototype.clone = function( deep ) {
        var n = new Node();
        n.tagName = this.tagName;
        n.value = this.value;
        if( this._attrs ) {
            n._attrs = {};
            this.eachAttr(function( v, k ) {
                n._attrs.k = v;
            });
        }
        if ( deep ) {
            var children = this.children(),
                i = 0,
                l = children.length;
            if ( children.length ) {
                for( ; i<l; i++ ) {
                    n.append( children[i].clone( deep ) );
                }
            }
        }
        return n;
    };
    /**
     * 判断一个节点是否其祖先节点的最下面的节点
     * @param {object} relative 祖先元素，默认为当前节点的父节点
     * @return {boolean} 
     */
    Node.prototype.isLast = function( relative ) {
        if ( relative ) {
            var node = this;
            do{
                if ( !node.isLast() ) {
                    return false;
                }
                node = node._parent;
            } while( node !== relative );
            return true;
        } else {
            var i = this.getIndex();
            if ( ~i ) {
                return i === this._parent._children.length - 1;
            } else {
                // 没有父节点，或不是父节点的子元素
                return true;
            }
        }
    };
    /**
     * 判断一个节点是否其祖先节点的最上面的节点
     * @param {object} relative 祖先元素，默认为当前节点的父节点
     * @return {boolean} 
     */
    Node.prototype.isFirst = function( relative ) {
        if ( relative ) {
            var node = this;
            do{
                if ( !node.isFirst() ) {
                    return false;
                }
                node = node._parent;
            } while( node !== relative );
            return true;
        } else {
            var i = this.getIndex();
            if ( ~i ) {
                return i === 0;
            } else {
                // 没有父节点，或不是父节点的子元素
                return true;
            }
        }
    };
    var Util = {

            inlineUbbTags: ['#text','bold','italic','color','link','image','video',],
            /**
             * 判断display样式是否是换行的样式
             */
            isBlock: function( displayStyle ) {
                return ~$.inArray( displayStyle, [
                    'block',
                    'table',
                    'table-cell',
                    'table-caption',
                    'table-footer-group',
                    'table-header-group',
                    'table-row',
                    'table-row-group'
                ]);
            },
            /**
             * 判断一个样式是否为bold
             */
            isBold: function( fontWeight ) {
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
            isItalic: function( fontWeight ) {
                return /^(italic|oblique)$/.test( fontWeight );
            },
            /**
             * 判断是否是一个有序列表
             */
            isOrderedList: function( listStyleType ) {
                return listStyleType !== 'none' && !this.isUnOrderedList( listStyleType );
            },
            /**
             * 判断是否是一个无序列表
             */
            isUnOrderedList: function( listStyleType ) {
                return /^(disc|circle|square)$/.test( listStyleType );
            },
            /**
             * 解析list，ul、ol或者是其他list-style符合的元素
             * @param {object} $node 节点
             */
            parseListNode: function( $node, parentNode ) {
                var start = new Node(),
                    listStyleType = $node.css('list-style-type');
                if ( listStyleType === 'none' ) {
                    return [start];
                }
                var listType = this.isUnOrderedList( listStyleType ) ? 'ul' :'ol';
                start.tagName = 'li';
                // 如果有父元素，且其祖先元素有tag为ul或ol
                if ( parentNode && (parentNode = parentNode.findAncestorByTagName(['ul','ol'], true)) ) {
                    // 如果父元素的listType与li的listType相同，则略过，即默认添加
                    if ( parentNode.tagName === listType ) {
                    // 如果不同则重新生成一个ul/ol
                    } else {
                        // 修改父节点tagName
                        parentNode.tagName = listType;
                    }
                    return [start];
                // 如果没有父元素为ul/ol
                } else {
                    var n = new Node();
                    n.tagName = 'li';
                    start.tagName = listType;
                    start.append( n );
                    return [start, n];
                }
            },
            /**
             * 将颜色值转行成Hex方式展示
             * @param {string} oldColor
             * @return {string} hex格式的颜色值
             */
            RGBtoHEX: function ( oldColor ) {
                var RGB2HexValue = '',
                    regExp = /([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)/,
                    array = regExp.exec(oldColor);
                if (!array) {
                    RGB2HexValue = oldColor;
                } else {
                    for (i = 1; i < array.length; i++) {
                        RGB2HexValue += ('0' + parseInt(array[i]).toString(16)).slice(-2);
                    }
                    RGB2HexValue = '#' + RGB2HexValue;
                };
                return RGB2HexValue;
            },
            /**
             * http://jsfiddle.net/zmmbreeze/wmnVp/
             * 处理换行、空格、&nbsp;
             * 不处理自动换行
             * @param {object} $node 节点
             * @param {object} re 对象
             * @param {object} setting 配置
             * @return {boolean} 是否需要转换成节点
             */
            parseTextNode: function( $node, start, setting ) {
                start.tagName = '#text';
                var text = $node.text();
                // 如果没有字符传
                if ( !text ) {
                    return false;
                }
                var $container = $node.parent(),
                    color,
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
                if ( text === '' ) {
                    return false;
                }
                start.value = text.replace( '\xa0', ' ' );

                // inline 样式在这里处理
                if ( Util.isBold( $container.css('font-weight') ) ) {
                    var n = start.clone();
                    start.tagName = 'bold';
                    start.value = null;
                    start.append(n);
                }
                if ( Util.isItalic( $container.css('font-style') ) ) {
                    var n = start.clone(true);
                    start.tagName = 'italic';
                    start.value = null;
                    start.detachChildren();
                    start.append(n);
                }
                if ( (color = Util.RGBtoHEX($container.css('color')))
                    && color !== setting.defaultColor ) {
                    var n = start.clone(true);
                    start.tagName = 'color';
                    start.attr( 'color',  color );
                    start.value = null;
                    start.detachChildren();
                    start.append(n);
                }
                return true;
            },
            /**
             * 解析单个jquery object为Node 对象
             * @param {object} $node jquery object
             * @param {object} currentNode 当前解析完成的节点(即父节点)
             * @param {object} setting 配置
             * @return {object/array} 返回解析之后的节点，如果这个节点不需要则返回空，如果是一个dom解析成多个节点则返回数组:[start, end]
             */
            parse$Node: function( $node, currentNode, setting ) {
                var tmp,
                    start,                                  // 开始节点
                    end,                                    // 结束节点
                    node = $node[0],                        // 元素的dom
                    nodeName = node.nodeName.toLowerCase(),
                    nodeType = node.nodeType,
                    display = $node.css('display');
                if ( nodeType === 8 ) {
                    return;
                }
                // list
                if( display === 'list-item' ) {
                    // 重新定位到另一个新生成的父节点
                    tmp = Util.parseListNode( $node, currentNode );
                    start = tmp[0];
                    end = tmp[1];
                } else {
                    start = new Node();
                }

                // block
                if( Util.isBlock( display ) ) {
                    start.tagName = '#line';
                    start.attr( '_isBlock', true );
                    start.attr( '_isWrap', $node.height() > 0 ); // 根据高度，判断block元素是否是表现为一行
                }
                switch( nodeName ) {
                    case 'img':
                        start.value = $node.data('src');
                        // 处理图片
                        if ( !start.value ) {
                            start.value = $node.attr('src');
                            start.tagName = 'image';
                        // 处理视频
                        } else {
                            start.tagName = 'video';
                        }
                        break;
                    case 'embed':
                        // 处理swf
                        // 此处跳过
                        break;
                    case 'a':
                        // 处理a标签
                        start.tagName = 'link';
                        start.attr( 'href', $node.attr('href') );
                        break;
                    case 'blockquote':
                        // 处理blockquote
                        start.tagName = 'blockquote';
                        break;
                    case 'ul':
                        start.tagName = 'ul';
                        break;
                    case 'ol':
                        start.tagName = 'ol';
                        break;
                    case '#text':
                        // 处理文本节点
                        if ( !Util.parseTextNode( $node, start, setting ) ) {
                            return;
                        }
                        break;
                    case 'br':
                        start.tagName = 'br';
                        break;
                    default:
                        break;
                }
                return end ? [start, end] : start;
            },
            /**
             * 生成一行
             *  如果前一节点最后有换行属性showLastNewLine，那本节点就不在前面加换行。
             *  字符串结束加换行
             * @param {object} node 节点
             * @param {string} sonString 字符串
             * @param {array} re 数组
             */
            drawLine: function( node, sonString, re ) {
                var prev;
                if ( node.attr('_isWrap') !== false ) {
                    if ( !node.isFirst() && !node.prev().attr( '_showLastNewLine' ) ) {
                        re.push('\n');
                    }
                    re.push(sonString);
                    if ( !node.isLast() ) {
                        re.push('\n');
                        node.attr( '_showLastNewLine', true );
                    }
                } else if( (prev=node.prev()) && (!prev.attr('_isBlock') && prev.tagName !== 'br') ) {
                    re.push('\n');
                    node.attr( '_showLastNewLine', true );
                }
            },
            /**
             * 生成每个节点对应的字符串
             * @param {object} node 节点
             * @return {string} 字符串
             */
            rendUbbTag: function( node, sonString ) {
                var re = [];
                switch( node.tagName ) {
                    case '#line':
                        /*var children,
                            prevTag;
                        if (node.parent()
                            && (prevTag = node.prev())
                            && prevTag.tagName !== 'br'
                            && (children = node.children())
                            && children.length
                            && children[0].tagName === '#text' ) {
                            re.push('\n');
                        }*/
                        Util.drawLine( node, sonString, re );
                        break;
                    case '#text':
                        re.push(node.value);
                        break;
                    case 'color':
                        re.push('[color=');
                        re.push( node.attr('color') );
                        re.push(']');
                        re.push(sonString);
                        re.push('[/color]');
                        break;
                    case 'li':
                        Util.drawLine( node, sonString, re );
                        break;
                    case 'ul':
                        Util.drawLine( node, '[ul]\n'+sonString+'\n[/ul]', re );
                        break;
                    case 'ol':
                        Util.drawLine( node, '[ol]\n'+sonString+'\n[/ol]', re );
                        break;
                    case 'br':
                        var block = node.findAncestorByTagName(['#line','li','ul','ol']);
                        if ( !node.isFirst( block ) && !node.isLast( block ) ) {
                            re.push('\n');
                            node.attr( '_showLastNewLine', true );
                        }
                        break;
                    default:
                        var s = '[';
                        s += node.tagName;
                        node.eachAttr(function( value, key ) {
                            if ( key.indexOf('_') !== 0 ) {
                                s += ' ';
                                s += key;
                                s += '=';
                                s += value;
                            }
                        });
                        s += ']';
                        s += node.value;
                        s += sonString;
                        s += '[/';
                        s += node.tagName;
                        s += ']';
                        if ( node.attr('_isBlock') ) {
                            Util.drawLine( node, s, re );
                        } else {
                            re.push( s );
                        }
                        break;
                }
                return re.join('');
            }
        },
        /**
         * 解析jquery object（树）为Node 对象
         * @param {object} $node jquery object
         * @param {object} currentNode 当前解析完成的节点(即父节点)
         * @param {object} setting 配置
         * @param {object} 解析完成的节点
             */
        parseHtml = function( $node, currentNode, setting ) {
            if ( $node.length !== 1 ) {
                throw 'ParseHtml: $node must only contains one element!';
            }
            var $children = $node.contents(),
                start = Util.parse$Node( $node, currentNode, setting ),    // 父节点添加此节点
                end,                                                       // 子节点添加的位置
                i = 0,
                l = $children.length,
                ii = 0,
                ll;
            // 不用解析的节点，则直接返回。例如注释,或者为空的字符串
            if ( start == null ) {
                return;
            }
            // 如果返回的是数组
            if ( start.length === 2 ) {
                end = start[1];
                start = start[0];
            } else {
                end = start;
            }

            // 添加上下文关系
            if ( currentNode ) {
                // 正常节点
                if ( start.tagName ) {
                    currentNode.append( start );
                // 没有tagName则此节点为空节点，则直接添加子节点
                } else {
                    end = currentNode;
                }
            }
            // 解析子节点
            for( i=0; i<l; i++ ) {
                parseHtml( $children.eq(i), end, setting );
            }
            return start;
        },
        rendHtml = function( node ) {
            
        },
        parseUbb = function( ubb ) {
            
        },
        rendUbb = function( node, setting ) {
            var re = [],
                i,
                l,
                children = node.children();
            for( i=0,l=children.length; i<l; i++ ) {
                re.push( rendUbb( children[i], setting ) );
            }
            return Util.rendUbbTag( node, re.join(''), setting );
        };

    return function ( setting ) {
        this.setting = $.extend( {
                            defaultColor: '#000000',
                            'line-height': 24
                        }, setting );
        this.HTMLtoUBB = function ( $dom ) {
            var node = parseHtml($dom, null, this.setting);
            return rendUbb( node, this.setting );
        };
        this.UBBtoHTML = function( ubb ) {
        };
        this.Node = Node;
    };
})();
