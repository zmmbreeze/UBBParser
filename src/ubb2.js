/**
 * UBB与html的转换库
 * @author mzhou
 * @version 0.2
 * @log 0.1 完成HTMLtoUBB方法
 *      0.2 完成UBBtoHTML
 */


/*jshint undef:true, browser:true, noarg:true, curly:true, regexp:true, newcap:true, trailing:false, noempty:true, regexp:false, strict:true, evil:true, funcscope:true, iterator:true, loopfunc:true, multistr:true, boss:true, eqnull:true, eqeqeq:false, undef:true */
/*global $:false */

var Node = (function() {
    'use strict';
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
        this.isNode = true;
        /*
        this.tagName = null;        // 标签名
        this.value = null;          // 值
        this._attrs = null;         // 属性map;
        this._parent = null;        // 父节点
        this._children = null;      // 子节点数组;
        */
    }
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
        return this._children ? this._children.slice(0) : [];
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

    return Node;
})();

var UBB = (function () {
    'use strict';
    var ubbTagNameReg = /\[(\/)?([a-zA-Z]+)/,
        tagsParser = {
            bold: {
                /**
                 * parse html node to UBB text
                 * @param {string} nodeName nodeName
                 * @param {object} node jquery object
                 * @param {string} sonString the ubb text of node's children
                 * @param {object} setting
                 * @return {string} ubb text of node and it's children
                 */
                parseHTML: function(nodeName, node, sonString) {
                    if (nodeName === '#text') {
                        var container = node.parent();
                        if (Util.isBold(container.css('font-weight'))) {
                            return '[bold]'+sonString+'[/bold]';
                        }
                    }
                },
                /**
                 * parse UBB text to HTML text
                 * @param {object} tag object represent ubb tag.
                 *                     eg:
                 *                         start tag: {name: 'url', attr:' href=http://guokr.com' };
                 *                         end tag: {isClose: false, name: 'url', attr:' href=http://guokr.com' };
                 *                         string tag: 'This is a text'; (It's not contains '\n')
                 *                         \n tag: '\n'.
                 * @param {number} i index of this tag in tag list(array)
                 * @param {array} tags tag list
                 * @param {object} setting
                 * @return {string} html text
                 */
                parseUBB: function(tag) {
                    return tag.isClose ? '</b>' : '<b>';
                },
                // positive integer.
                // Tag with bigger priority can contians small one.
                // If equal, then they can contains each other.
                priority: 2,
                // bool.
                // If true, then this tag can contains '\n'.
                canWrap: 0,
                // bool.
                // If true, then the '\n' right after this tag should be ignore.
                isBlock: 0,
                noAttr: 1
            },
            italic: {
                parseHTML: function(nodeName, node, sonString) {
                    if (nodeName === '#text') {
                        var container = node.parent();
                        if (Util.isItalic(container.css('font-style'))) {
                            return '[italic]'+sonString+'[/italic]';
                        }
                    }
                },
                parseUBB: function(tag) {
                    return tag.isClose ? '</i>' : '<i>';
                },
                priority: 2,
                canWrap: 0,
                isBlock: 0,
                noAttr: 1
            },
            color: {
                parseHTML: function(nodeName, node, sonString, setting) {
                    if (nodeName === '#text') {
                        var color,
                            container = node.parent();
                        color = Util.RGBtoHEX(container.css('color'));
                        if (color && color !== setting.defaultColor && !(container[0].nodeName.toLowerCase() === 'a' && color === setting.linkDefaultColor)) {
                            return '[color='+color+']'+sonString+'[/color]';
                        }
                    }
                },
                parseUBB: function(tag) {
                    return tag.isClose ? '</span>' : '<span style="color:'+(tag.attr ? tag.attr.slice(1) : '')+';">';
                },
                priority: 2,
                canWrap: 0,
                isBlock: 0,
                noAttr: 0
            },
            url: {
                parseHTML: function(nodeName, node, sonString) {
                    if (nodeName === 'a') {
                        return '[url href='+node.attr('href')+']'+sonString+'[/url]';
                    }
                },
                parseUBB: function(tag, i, tags) {
                    if (tag.isClose) {
                        return '</a>';
                    } else {
                        var t,
                            l = tags.length,
                            href = tag.attr ? tag.attr.replace(/^\ href\=/, '') : '';
                        if (!tag.attr) {
                            i++;
                            // for [url]http://www.guokr.com/question/[bold]265263[/bold]/[/url]
                            for (; i<l; i++) {
                                t = tags[i];
                                if (t.isClose && t.name === 'url') {
                                    break;
                                } else if (typeof t === 'string') {
                                    href += t;
                                }
                            }
                        }
                        return '<a href="'+href+'">';
                    }
                },
                priority: 2,
                canWrap: 0,
                isBlock: 0,
                noAttr: 0
            },
            image: {
                parseHTML: function(nodeName, node) {
                    if (nodeName === 'img' && !node.data('src')) {
                        return '[image]'+node.attr('src')+'[/image]';
                    }
                },
                parseUBB: function(tag, i, tags) {
                    if (tag.isClose) {
                        return '';
                    } else {
                        var src,
                            nextTag = tags[i+1];
                        if (typeof nextTag === 'string') {
                            src = nextTag;
                            tags[i+1] = ''; // set next text tag = ''
                        } else {
                            src = '';
                        }
                        return  src ? '<img src="'+src+'"/>' : '';
                    }
                },
                priority: 1,
                canWrap: 0,
                isBlock: 0,
                noAttr: 1
            },
            video: {
                parseHTML: function(nodeName, node) {
                    var src;
                    if (nodeName === 'img' && (src = node.data('src'))) {
                        return '[video]'+src+'[/video]';
                    }
                },
                parseUBB: function(tag, i, tags, setting) {
                    if (tag.isClose) {
                        return '';
                    } else {
                        var src,
                            nextTag = tags[i+1];
                        if (typeof nextTag === 'string') {
                            src = nextTag;
                            tags[i+1] = '';
                        } else {
                            src = '';
                        }
                        return src ? '<img class="gui-ubb-flash" data-src="'+src+'" src="'+setting.flashImage+'" width="480" height="400"/>' : '';
                    }
                },
                priority: 1,
                canWrap: 0,
                isBlock: 0,
                noAttr: 1
            },
            flash: {
                parseUBB: function(tag, i, tags, setting) {
                    if (tag.isClose) {
                        return '';
                    } else {
                        var src,
                            nextTag = tags[i+1];
                        if (typeof nextTag === 'string') {
                            src = nextTag;
                            tags[i+1] = '';
                        } else {
                            src = '';
                        }
                        return src ? '<img class="gui-ubb-flash" data-src="'+src+'" src="'+setting.flashImage+'" width="480" height="400"/>' : '';
                    }
                },
                priority: 1,
                canWrap: 0,
                isBlock: 0,
                noAttr: 1
            },
            blockquote: {
                parseHTML: function(nodeName, node, sonString) {
                    if (nodeName === 'blockquote') {
                        return '[blockquote]'+sonString+'[/blockquote]';
                    }
                },
                parseUBB: function(tag) {
                    return tag.isClose ? '</blockquote>' : '<blockquote>';
                },
                priority: 3,
                canWrap: 1,
                isBlock: 1,
                noAttr: 1
            },
            ul: {
                parseHTML: function(nodeName, node, sonString) {
                    if (nodeName === 'ul') {
                        return '[ul]\n'+sonString+'\n[/ul]';
                    }
                    // in IE <= 7, node is block
                    if (nodeName === 'li' && !Util.isBlock(node)) {
                        var parent = node.parent()[0];
                        // if its parent is ul and it's not the last node
                        if (parent && parent.nodeName.toLowerCase() === 'ul' && node.next().length) {
                            return sonString + '\n';
                        }
                    }
                },
                parseUBB: function(tag, i, tags) {
                    if (tag.isClose) {
                        return '</li></ul>';
                    } else {
                        var l = tags.length,
                            innerTags = [],
                            tagIndexs = [],
                            t, index;
                        i++;
                        for (; i<l; i++) {
                            t = tags[i];
                            if (t.name === 'ul') {
                                break;
                            }
                            if (typeof t === 'string') {
                                innerTags.push(t);
                                tagIndexs.push(i);
                            }
                        }
                        for (i=0,l=innerTags.length; i<l; i++) {
                            t = innerTags[i];
                            index = tagIndexs[i];
                            // add <li>text</li>
                            if (t && t === '\n') {
                                tags[index] = (i === 0 || i === l-1) ? '' : '</li><li>';
                            }
                        }
                        return '<ul><li>';
                    }
                },
                priority: 3,
                canWrap: 1,
                isBlock: 1,
                noAttr: 1
            },
            ol: {
                parseHTML: function(nodeName, node, sonString) {
                    if (nodeName === 'ol') {
                        return '[ol]\n'+sonString+'\n[/ol]';
                    }
                    // in IE <= 7, node is block
                    if (nodeName === 'li' && !Util.isBlock(node)) {
                        var parent = node.parent()[0];
                        // if its parent is ul and it's not the last node
                        if (parent && parent.nodeName.toLowerCase() === 'ol' && node.next().length) {
                            return sonString + '\n';
                        }
                    }
                },
                parseUBB: function(tag, i, tags) {
                    if (tag.isClose) {
                        return '</li></ol>';
                    } else {
                        var l = tags.length,
                            innerTags = [],
                            tagIndexs = [],
                            t, index;
                        i++;
                        for (; i<l; i++) {
                            t = tags[i];
                            if (t.name === 'ol') {
                                break;
                            }
                            if (typeof t === 'string') {
                                innerTags.push(t);
                                tagIndexs.push(i);
                            }
                        }
                        for (i=0,l=innerTags.length; i<l; i++) {
                            t = innerTags[i];
                            index = tagIndexs[i];
                            // add <li>text</li>
                            if (t && t === '\n') {
                                tags[index] = (i === 0 || i === l-1) ? '' : '</li><li>';
                            }
                        }
                        return '<ol><li>';
                    }
                },
                priority: 3,
                canWrap: 1,
                isBlock: 1,
                noAttr: 1
            },
            ref: {
                parseHTML: function(nodeName, node, sonString) {
                    if (nodeName === 'div' && node[0].className === 'gui-ubb-ref') {
                        return '[ref]'+sonString+'[/ref]';
                    }
                },
                parseUBB: function(tag, i, tags) {
                    return tag.isClose ? '</div>' : '<div class="gui-ubb-ref">';
                },
                priority: 1,
                canWrap: 0,
                isBlock: 1,
                noAttr: 1
            }
        },
        // cache for closeTag
        closeTagCache = {},
        // cache for startTag
        startTagCache = {},
        Util = {
            /**
             * if node is block a line.
             * @param {object} node jquery object
             * @return {boolean}
             */
            isBlock: function(node) {
                return ~$.inArray( node.css('display'), [
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
             * if fontWeight is bold
             * @param {string} fontWeight
             * @return {boolean}
             */
            isBold: function(fontWeight) {
                var number = parseInt(fontWeight, 10);
                if(isNaN(number)) {
                    return (/^(bold|bolder)$/).test(fontWeight);
                } else {
                    return number > 400;
                }
            },
            /**
             * if fontStyle is italic
             * @param {string} fontStyle
             * @return {boolean}
             */
            isItalic: function(fontStyle) {
                return (/^(italic|oblique)$/).test(fontStyle);
            },
            /**
             * change RGB to HEX
             * @param {string} oldColor rbg color
             * @return {string} hex color
             */
            RGBtoHEX: function ( oldColor ) {
                var i,
                    RGB2HexValue = '',
                    numbers,
                    regExp = /([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)/,
                    array = regExp.exec(oldColor);
                if (!array) {
                    if ( oldColor.length === 4 ) {
                        numbers = oldColor.split('').slice(1);
                        RGB2HexValue = '#';
                        for ( i=0; i<3; i++ ) {
                            RGB2HexValue += numbers[i]+numbers[i];
                        }
                    } else {
                        RGB2HexValue = oldColor;
                    }
                } else {
                    for (i = 1; i < array.length; i++) {
                        RGB2HexValue += ('0' + parseInt(array[i], 10).toString(16)).slice(-2);
                    }
                    RGB2HexValue = '#' + RGB2HexValue;
                }
                return RGB2HexValue;
            },
            ubbEscape: function(str) {
                return str.replace(/(\[|\])/g, '\\$1');
            },
            /**
             * parse jquery node to ubb text
             * @param {object} node jquery object
             * @param {string} sonString the ubb text of node's children
             * @param {object} setting
             * @return {string} ubb text of node and it's children
             */
            parseNode: function(node, sonString, setting) {
                var tagName, tagParser, tmp, addNewLineLater,
                    nodeType = node[0].nodeType,
                    nodeName = node[0].nodeName.toLowerCase();
                // comments
                if (nodeType === 8) {
                    return;
                }
                // text
                if (nodeType !== 3) {
                    // node是block元素，并且它不是父元素的最后一个节点
                    if (Util.isBlock(node) && !(Util.isBlock(node.parent()) && !node.next().length) ) {
                        addNewLineLater = true;
                    }
                    if (nodeName === 'br') {
                        sonString = sonString + '\n';
                    }
                } else {
                    sonString = node.text();
                    if (!setting.keepWhiteSpace) {
                        sonString = $.trim(sonString)
                                     .replace(/\s{2,}/g,' ');
                    }
                    if (!setting.keepNewLine) {
                        sonString = sonString.replace(/\n/g,'');
                    }
                    sonString = Util.ubbEscape(sonString);
                    if (sonString === '') {
                        return;
                    }
                }
                for (tagName in setting.tags) {
                    tagParser = setting.tags[tagName];
                    if (tagParser.parseHTML) {
                        tmp = tagParser.parseHTML(nodeName, node, sonString, setting);
                        if (tmp) {
                            sonString = tmp;
                        }
                    }
                }
                if (addNewLineLater) {
                    sonString = sonString + '\n';
                }
                return sonString;
            },
            /**
             * get cached close ubb tag
             * @param {object/string} startTag start tag or name of tag
             * @return {object} closeTag
             */
            getCloseUbbTag: function(startTag) {
                var name = typeof startTag === 'string' ? startTag : startTag.name,
                    closeTag = closeTagCache[name];
                if (closeTag == null) {
                    closeTag = {name: name, isClose: true};
                    closeTagCache[name] = closeTag;
                }
                return closeTag;
            },
            /**
             * get cached start ubb tag
             * @param {string} name name of tag
             * @return {object} startTag
             */
            getStartUbbTag: function(name) {
                var startTag = startTagCache[name];
                if (startTag == null) {
                    startTag = {name: name};
                    startTagCache[name] = startTag;
                }
                return startTag;
            },
            /**
             * can father contains son
             * @param {object} father father tag
             * @param {object} son son tag
             * @param {object} ubbTagsPriority prioritys for all tags
             * @return {boolean}
             */
            canContains: function(father, son, ubbTagsPriority) {
                return ubbTagsPriority[father.name] >= ubbTagsPriority[son.name];
            },
            /**
             * push tags into two stack reversed
             * @param {array} tags tags to be push
             * @param {array} stack1
             * @param {array} stack2
             */
            pushTagsReverse: function(tags, stack1, stack2) {
                if (tags) {
                    var t, i;
                    for (i = tags.length-1; i>=0; i--) {
                        t = tags[i];
                        stack1.push(t);
                        stack2.push(t);
                    }
                }
            },
            /**
             * push open ubb tag into stack
             * @param {array} unMatchedOpenTags
             * @param {array} stack
             * @param {object} tag tags to be push
             * @param {object} ubbTagsPriority
             */
            pushOpenUbbTag: function(unMatchedOpenTags, stack, tag, ubbTagsPriority) {
                var i, t, autoClosedTags;
                for (i = unMatchedOpenTags.length-1; i>=0; i--) {
                    t = unMatchedOpenTags[i];
                    // can contains
                    if (Util.canContains(t, tag, ubbTagsPriority)) {
                        break;
                    } else {
                        autoClosedTags = autoClosedTags || [];
                        autoClosedTags.push(unMatchedOpenTags.pop());
                        stack.push(Util.getCloseUbbTag(t));
                    }
                }
                unMatchedOpenTags.push(tag);
                stack.push(tag);
                Util.pushTagsReverse(autoClosedTags, unMatchedOpenTags, stack);
                autoClosedTags = null;
            },
            /**
             * push close ubb tag into stack
             * @param {array} unMatchedOpenTags
             * @param {array} stack
             * @param {object} closeTag tags to be push
             */
            pushCloseUbbTag: function(unMatchedOpenTags, stack, closeTag) {
                var tag, i, autoClosedTags, t, l;
                for (i = unMatchedOpenTags.length-1; i>=0; i--) {
                    tag = unMatchedOpenTags[i];
                    // tag match
                    if (closeTag && closeTag.name === tag.name) {
                        l = unMatchedOpenTags.length - 1;
                        // autoClosedTags
                        while(i<l) {
                            i++;
                            t = unMatchedOpenTags.pop();
                            autoClosedTags = autoClosedTags || [];
                            autoClosedTags.push(t);
                            stack.push(Util.getCloseUbbTag(t));
                        }
                        unMatchedOpenTags.pop(); // pop the matched tag
                        stack.push(closeTag);
                        Util.pushTagsReverse(autoClosedTags, unMatchedOpenTags, stack);
                        autoClosedTags = null;
                        return;
                    }
                }
                // no match
            },
            /**
             * push ubb tags into stack
             * @param {array} stack
             * @param {object} tags tags to be push
             */
            pushPrefixUbbTag: function(stack, tags) {
                var i = tags.length-1;
                for (; i>=0; i--) {
                    stack.push(tags[i]);
                }
            },
            /**
             * push ubb close tags into stack reserved
             * @param {array} stack
             * @param {object} tags tags to be push
             */
            pushSuffixUbbTag: function(stack, tags) {
                var i,l;
                for (i=0,l=tags.length; i<l; i++) {
                    stack.push(Util.getCloseUbbTag(tags[i]));
                }
            },
            /**
             * push '\n' into stack
             * @param {array} openTags unMatchedOpenTags
             * @param {array} stack
             * @param {string} textTag '\n' tag
             * @param {object} wrapUbbTags canWrap value
             */
            pushLineUbbTag: function(openTags, stack, textTag, wrapUbbTags) {
                var i, tag, inlineTags, j;

                inlineTags = [];
                // find latest inline open tags
                for (j = openTags.length-1; j >= 0; j--) {
                    tag = openTags[j];
                    if (!wrapUbbTags[tag.name]) {
                        inlineTags.push(tag);
                    } else {
                        break;
                    }
                }

                // finded
                if (inlineTags.length) {
                    // push close tag
                    Util.pushSuffixUbbTag(stack, inlineTags);
                    stack.push('\n');
                    // push open tag
                    Util.pushPrefixUbbTag(stack, inlineTags);
                // nope
                } else {
                    stack.push('\n');
                }
            },
            /**
             * html encode
             * @param {string} str html string
             * @return {string} encoded html string
             */
            htmlEncode: function (str) {
                if (str) {
                    str = str.replace(/&/igm, '&amp;');
                    str = str.replace(/</igm, '&lt;');
                    str = str.replace(/>/igm, '&gt;');
                    str = str.replace(/\"/igm, '&quot;');
                }
                return str;
            },
            /**
             * scan ubb text into tag list
             * @param {string} text ubb text
             * @param {object} ubbTagsPriority
             * @param {object} wrapUbbTags
             * @return {array} tag list
             */
            scanUbbText: function(text, ubbTagsPriority, wrapUbbTags) {
                // encode html
                text = Util.htmlEncode(text);
                text = text.replace(/\r\n/g, '\n'); // for IE hack
                var c, r, tagName, tag, prevOpenTag, attr, isClose,
                    // state value represent next char not be escape
                    NOESCAPE = 0,
                    // state value represent next char should be escape
                    ESCAPE = 1,
                    // state value
                    state = NOESCAPE,
                    j = 0,
                    i = 0,
                    l = text.length,
                    buf = '',
                    node = {};
                for(; i<l; i++) {
                    c = text.charAt(i);
                    switch(c) {
                    case '\\':
                        state = ESCAPE;
                        break;
                    case '[':
                        if (state === ESCAPE) {
                            buf += '[';
                            state = NOESCAPE;
                        } else {
                            if (buf) {
                                stack.push(buf);
                            }
                            buf = '[';
                        }
                        break;
                    case ']':
                        if (state === ESCAPE) {
                            buf += ']';
                            state = NOESCAPE;
                        } else {
                            r = ubbTagNameReg.exec(buf);
                            // is tag
                            if (r && r[2] && ubbTagsPriority[tagName = r[2].toLowerCase()]) {
                                isClose = !!r[1];
                                if (isClose) {
                                    tag = Util.getCloseUbbTag(tagName);
                                } else {
                                    attr = buf.slice(r[2].length + (r[1] ? 2 : 1));
                                    tag = attr ? {name: tagName, attr: attr} : Util.getStartUbbTag(tagName);
                                }

                                prevOpenTag = unMatchedOpenTags[unMatchedOpenTags.length-1];
                                // close
                                if (tag.isClose) {
                                    if (!prevOpenTag) {
                                        // unused tag has to be clear
                                        buf = '';
                                        continue;
                                    }
                                    Util.pushCloseUbbTag(unMatchedOpenTags, stack, tag);
                                // open
                                } else {
                                    Util.pushOpenUbbTag(unMatchedOpenTags, stack, tag, ubbTagsPriority);
                                }
                            // not tag
                            } else {
                                stack.push(buf + ']');
                            }
                            buf = '';
                        }
                        break;
                    case '\n':
                        if (state === ESCAPE) {
                            state = NOESCAPE;
                        }
                        if (buf) {
                            stack.push(buf);
                            buf = '';
                        }
                        Util.pushLineUbbTag(unMatchedOpenTags, stack, '\n', wrapUbbTags);
                        break;
                    default:
                        if (state === ESCAPE) {
                            state = NOESCAPE;
                        }
                        buf += c;
                        break;
                    }
                }
                if (buf) {
                    stack.push(buf);
                }

                // complete all unmatched open tag
                for (j = unMatchedOpenTags.length-1; j>=0; j--) {
                    stack.push(Util.getCloseUbbTag(unMatchedOpenTags[j]));
                }
                return stack;
            }
        },
        /**
         * parse jquery node into html
         * @param {object} node jquery object
         * @param {object} setting
         * @param {object} parent jquery object
         * @return {string} ubb text
         */
        parseHtml = function(node, setting, parent) {
            var i,l,
                re = [],
                children = node.contents();
            for(i=0,l=children.length; i<l; i++) {
                re.push(parseHtml(children.eq(i), setting, node));
            }
            // make sure container not to be parsed
            if (parent) {
                return Util.parseNode(node, re.join(''), setting);
            } else {
                return re.join('');
            }
        },
        /**
         * parse ubb text into html text
         * @param {string} ubb
         * @param {object} setting 配置
         * @return {string} html text
         */
        parseUbb = function(ubb, setting) {
            var i, l, tag, nextTag,
                isStartWithNewLine = /^\n/,
                str = '',
                tags = Util.scanUbbText(ubb, setting.ubbTagsPriority, setting.wrapUbbTags),
                tagsParser = setting.tags,
                tagInfo;
            for (i=0,l=tags.length; i<l; i++) {
                tag = tags[i];
                if (tag === '\n') {
                    str += '<br/>';
                } else if (typeof tag === 'string') {
                    str += tag;
                } else {
                    tagInfo = tagsParser[tag.name];
                    str += tagInfo.parseUBB(tag, i, tags, setting);
                    // remove first new line after a close block tag
                    if (tagInfo.isBlock && tag.isClose) {
                        nextTag = tags[i+1];
                        if (nextTag && nextTag === '\n') {
                            tags[i+1] = '';
                        }
                    }
                }
            }
            return str;
        },
        /**
         * auto complete ubb string
         * fix error placed tags
         * @param {string} ubb
         * @param {object} setting
         * @return {string} fixed ubb string
         */
        fixUbb = function(ubb, setting) {
            var i, l, tag, nextTag,
                isStartWithNewLine = /^\n/,
                str = '',
                tags = Util.scanUbbText(ubb, setting.ubbTagsPriority, setting.wrapUbbTags);
            for (i=0,l=tags.length; i<l; i++) {
                tag = tags[i];
                if (typeof tag === 'string') {
                    str += Util.ubbEscape(tag);
                } else {
                    str += '[' + (tag.isClose ? '/' : '') + tag.name + (tag.attr || '') + ']';
                }
            }
            return str;
        };

    /**
     *  var ubbParser = new UBB();
     *  @param {object} setting
     */
    function UBB(setting) {
        this.setting = $.extend({
                            // color of all text element
                            defaultColor: '#000000',
                            // color of a elment
                            linkDefaultColor: '#006699',
                            // if keep white space in html text when converting
                            keepWhiteSpace: true,
                            // if keep new line space in html text when converting
                            keepNewLine: false,
                            // flash image to show
                            flashImage: '/skin/imgs/flash.png'
                       }, setting);
        this.setting.tags = $.extend(tagsParser, this.setting.tags);
        this.setting.ubbTagsPriority = {};
        this.setting.wrapUbbTags = {};
        var k, v;
        setting = this.setting;
        for (k in setting.tags) {
            v = setting.tags[k];
            setting.ubbTagsPriority[k] = v.priority;
            setting.wrapUbbTags[k] = v.canWrap;
        }
    }
    UBB.Util = Util;
    /**
     * @param {object} $dom jquery
     * @return {string} ubb text
     */
    UBB.prototype.HTMLtoUBB = function ($dom) {
        return parseHtml($dom, this.setting);
    };
    /**
     * @param {string} ubb text
     * @return {string} html text
     */
    UBB.prototype.UBBtoHTML = function(ubb) {
        return parseUbb(ubb, this.setting);
    };
    /**
     * fix error ubb text
     * @param {string} ubb text
     * @return {string} fixed ubb text
     */
    UBB.prototype.fixUBB = function(ubb) {
        return fixUbb(ubb, this.setting);
    };
    return UBB;
})();
