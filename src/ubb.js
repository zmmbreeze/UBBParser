/**
 * UBB与html的转换库
 * @author mzhou
 * @version 0.2
 * @log 0.1 完成HTMLtoUBB方法
 *      0.2 完成UBBtoHTML
 */


/*jshint undef:true, browser:true, noarg:true, curly:true, regexp:true, newcap:true, trailing:false, noempty:true, regexp:false, strict:true, evil:true, funcscope:true, iterator:true, loopfunc:true, multistr:true, boss:true, eqnull:true, eqeqeq:false, undef:true */
/*global $:false */


var UBB = (function () {
    'use strict';
    var ubbTagNameReg = /\[(\/)?([a-zA-Z]+)/,
        tagsParser = {
            bold: {
                parseHTML: function(nodeName, node, songString) {
                    if (nodeName === '#text') {
                        var container = node.parent();
                        if (Util.isBold(container.css('font-weight'))) {
                            return '[bold]'+songString+'[/bold]';
                        }
                    }
                },
                parseUBB: function(tag) {
                    return tag.isClose ? '</b>' : '<b>';
                },
                // 值代表优先级，优先级高的可以包含优先级低的标签，相同则可以互相包含，必须为正整数
                priority: 2,
                // 是否是行内标签, 1表示可以内部的字符串换行,0表示不能换行但要补全
                canWrap: 0,
                // 转换成html后是否是block元素，如果是则紧随其后的换行不会转换成br
                isBlock: 0,
                noAttr: 1
            },
            italic: {
                parseHTML: function(nodeName, node, songString) {
                    if (nodeName === '#text') {
                        var container = node.parent();
                        if (Util.isItalic(container.css('font-style'))) {
                            return '[italic]'+songString+'[/italic]';
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
                parseHTML: function(nodeName, node, songString, setting) {
                    if (nodeName === '#text') {
                        var color,
                            container = node.parent();
                        color = Util.RGBtoHEX(container.css('color'));
                        if (color && color !== setting.defaultColor && !(container[0].nodeName.toLowerCase() === 'a' && color === setting.linkDefaultColor)) {
                            return '[color='+color+']'+songString+'[/color]';
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
                parseHTML: function(nodeName, node, songString) {
                    if (nodeName === 'a') {
                        return '[url href='+node.attr('href')+']'+songString+'[/url]';
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
                parseHTML: function(nodeName, node, songString) {
                    if (nodeName === 'blockquote') {
                        return '[blockquote]'+songString+'[/blockquote]';
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
                parseHTML: function(nodeName, node, songString) {
                    if (nodeName === 'ul') {
                        return '[ul]\n'+songString+'\n[/ul]';
                    }
                    if (nodeName === 'li') {
                        var parent = node.parent()[0];
                        // if its parent is ul and it's not the last node
                        if (parent && parent.nodeName.toLowerCase() === 'ul' && node.next().length) {
                            return songString + '\n';
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
                parseHTML: function(nodeName, node, songString) {
                    if (nodeName === 'ol') {
                        return '[ol]\n'+songString+'\n[/ol]';
                    }
                    if (nodeName === 'li') {
                        var parent = node.parent()[0];
                        // if its parent is ul and it's not the last node
                        if (parent && parent.nodeName.toLowerCase() === 'ol' && node.next().length) {
                            return songString + '\n';
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
                parseHTML: function(nodeName, node, songString) {
                    if (nodeName === 'div' && node[0].className === 'gui-ubb-ref') {
                        return '[ref]'+songString+'[/ref]';
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
             * 判断display样式是否是换行的样式
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
             * 判断一个样式是否为bold
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
             * 判断一个样式是否为bold
             */
            isItalic: function( fontWeight ) {
                return (/^(italic|oblique)$/).test( fontWeight );
            },
            /**
             * 将颜色值转行成Hex方式展示
             * @param {string} oldColor
             * @return {string} hex格式的颜色值
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
             * 解析单个jquery object为Node 对象
             * @param {object} $node jquery object
             * @param {object} currentNode 当前解析完成的节点(即父节点)
             * @param {object} setting 配置
             * @return {object/array} 返回解析之后的节点，如果这个节点不需要则返回空，如果是一个dom解析成多个节点则返回数组:[start, end]
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
            canContains: function(father, son, ubbTagsPriority) {
                return ubbTagsPriority[father.name] >= ubbTagsPriority[son.name];
            },
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
            pushOpenUbbTag: function(tag, unMatchedOpenTags, stack, ubbTagsPriority) {
                // can contains
                var i, t, autoClosedTags;
                for (i = unMatchedOpenTags.length-1; i>=0; i--) {
                    t = unMatchedOpenTags[i];
                    // can contains
                    if (Util.canContains(t, tag, ubbTagsPriority)) {
                        break;
                    } else {
                        // 记录此标签,因为不能包含而自动关闭的标签
                        // tag.autoClosedTags = tag.autoClosedTags || [];
                        // tag.autoClosedTags.push(unMatchedOpenTags.pop());
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
            pushPrefixUbbTag: function(stack, tags) {
                var i = tags.length-1;
                for (; i>=0; i--) {
                    stack.push(tags[i]);
                }
            },
            pushSuffixUbbTag: function(stack, tags) {
                var i,l;
                for (i=0,l=tags.length; i<l; i++) {
                    stack.push(Util.getCloseUbbTag(tags[i]));
                }
            },
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
            htmlEncode: function (str) {
                if (str) {
                    str = str.replace(/&/igm, '&amp;');
                    str = str.replace(/</igm, '&lt;');
                    str = str.replace(/>/igm, '&gt;');
                    str = str.replace(/\"/igm, '&quot;');
                }
                return str;
            },
            scanUbbText: function(text, ubbTagsPriority, wrapUbbTags) {
                // encode html
                text = Util.htmlEncode(text);
                text = text.replace(/\r\n/g, '\n'); // for IE hack
                var c, r, tagName, tag, prevOpenTag, attr, isClose,
                    NOESCAPE = 0,
                    ESCAPE = 1,
                    state = NOESCAPE,
                    j = 0,
                    i = 0,
                    l = text.length,
                    buf = '',
                    unMatchedOpenTags = [],
                    stack = [];
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
                                    Util.pushOpenUbbTag(tag, unMatchedOpenTags, stack, ubbTagsPriority);
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
         * 解析ubb string为Node 对象
         * @param {string} ubb
         * @param {object} setting 配置
         * @param {string} 解析完成的节点
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
         * 处理ubb string，修复错误标签
         * @param {string} ubb
         * @param {object} setting 配置
         * @param {string} 解析完成的节点
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
     *  @param {object} setting 设置
     */
    function UBB(setting) {
        this.setting = $.extend({
                            defaultColor: '#000000',
                            linkDefaultColor: '#006699',
                            keepWhiteSpace: true,
                            keepNewLine: false,
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
    /**
     * @param {object} $dom jquery对象节点
     * @return {string} ubb字符串
     */
    UBB.prototype.HTMLtoUBB = function ($dom) {
        return parseHtml($dom, this.setting);
    };
    /**
     * @param {string} ubb 字符串
     * @return {string} html字符串
     */
    UBB.prototype.UBBtoHTML = function(ubb) {
        return parseUbb(ubb, this.setting);
    };
    UBB.prototype.fixUBB = function(ubb) {
        return fixUbb(ubb, this.setting);
    };
    return UBB;
})();
