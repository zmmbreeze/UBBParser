/**
 * UBBParser
 * @author mzhou / @zhoumm
 * @log 0.1
 */
(function() {
    UBB.extend(UBB.Util, {
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
        RGBtoHEX: function (oldColor) {
            var i,
                RGB2HexValue = '',
                numbers,
                regExp = /([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)/,
                array = regExp.exec(oldColor);
            if (!array) {
                if (oldColor.length === 4) {
                    numbers = oldColor.split('').slice(1);
                    RGB2HexValue = '#';
                    for (i=0; i<3; i++) {
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
        }
    });
    var Util = UBB.Util;
    UBB.addTags({
        // lowerCase tag name
        bold: {
            /**
             * parse html node to UBB text
             * @param {string} nodeName nodeName
             * @param {object} node jquery object
             * @param {string} re abstract node
             * @param {object} setting
             * @return {string} ubb text of node and it's children
             */
            parseHTML: function(nodeName, node, re) {
                if (nodeName === '#text') {
                    if (Util.isBold(Util.getComputedStyle(node.parentNode, 'font-weight'))) {
                        re.prefix = '[bold]' + (re.prefix || '');
                        re.suffix = (re.suffix || '') + '[/bold]';
                    }
                }
            },
            /**
             * parse UBB text to HTML text
             * @param {object} node object represent ubb tag.
             *                     eg:
             *                         tree node
             *                         string tag: 'This is a text'; (It's not contains '\n')
             *                         \n tag: '\n'.
             * @param {string} sonString
             * @param {object} setting
             * @return {string} html text
             */
            parseUBB: function(node, sonString, setting) {
                return '<b>' + sonString + '</b>';
            },
            // string.
            // Specified which tag can be contained.
            // '' or undefined indicate it can't contian any tag.
            // '*' indicate it can contian any tag.
            canContains: 'bold,italic,color,url,image',
            // bool.
            // If true, then this tag can contains '\n'.
            canWrap: 0,
            // bool.
            // If true, then the '\n' right after this tag should be ignore.
            isBlock: 0
        },
        italic: {
            parseHTML: function(nodeName, node, re) {
                if (nodeName === '#text') {
                    if (Util.isItalic(Util.getComputedStyle(node.parentNode, 'font-style'))) {
                        re.prefix = '[italic]' + (re.prefix || '');
                        re.suffix = (re.suffix || '') + '[/italic]';
                    }
                }
            },
            parseUBB: function(node, sonString, setting) {
                return '<i>' + sonString + '</i>';
            },
            canContains: 'bold,italic,color,url,image',
            canWrap: 0,
            isBlock: 0
        },
        color: {
            parseHTML: function(nodeName, node, re, setting) {
                if (nodeName === '#text') {
                    var color,
                        container = node.parentNode;
                    color = Util.RGBtoHEX(Util.getComputedStyle(container, 'color'));
                    if (color && color !== setting.defaultColor && !(container.nodeName.toLowerCase() === 'a' && color === setting.linkDefaultColor)) {
                        re.prefix = '[color='+color+']' + (re.prefix || '');
                        re.suffix = (re.suffix || '') + '[/color]';
                    }
                }
            },
            parseUBB: function(node, sonString, setting) {
                return '<span style="color:'+(node.attr ? node.attr.slice(1) : '')+';">' + sonString + '</span>';
            },
            canContains: 'bold,italic,color,url,image',
            canWrap: 0,
            isBlock: 0
        },
        url: {
            parseHTML: function(nodeName, node, re) {
                if (nodeName === 'a') {
                    re.prefix = '[url href=' + node.getAttribute('href') + ']' + (re.prefix || '');
                    re.suffix = (re.suffix || '') + '[/url]';
                }
            },
            parseUBB: function(node, sonString, setting) {
                var i, t, l,
                    href = node.attr ? node.attr.replace(/^\ href\=/, '') : '';
                if (!node.attr) {
                    // for [url]http://www.guokr.com/question/[bold]265263[/bold]/[/url]
                    for (i=0,l=node.length; i<l; i++) {
                        t = node[i];
                        if (t.name === '#text') {
                            href += t.value;
                        }
                    }
                }
                return '<a href="' + href + '">' + sonString + '</a>';
            },
            canContains: 'bold,italic,color,url,image',
            canWrap: 0,
            isBlock: 0
        },
        image: {
            parseHTML: function(nodeName, node, re) {
                if (nodeName === 'img' && !node.getAttribute('data-src')) {
                    re.prefix = '[image]' + node.getAttribute('src') + '[/image]' + (re.prefix || '');
                }
            },
            parseUBB: function(node, sonString, setting) {
                return sonString ? ('<img src="' + sonString + '"/>') : '';
            },
            canWrap: 0,
            isBlock: 0
        },
        video: {
            parseHTML: function(nodeName, node, re) {
                var src;
                if (nodeName === 'img' && (src = node.getAttribute('data-src'))) {
                    re.prefix = '[video]' + src + '[/video]' + (re.prefix || '');
                }
            },
            parseUBB: function(node, sonString, setting) {
                return sonString ? ('<img class="gui-ubb-flash" data-src="'+sonString+'" src="'+setting.flashImage+'" width="480" height="400"/>') : '';
            },
            canWrap: 0,
            isBlock: 0
        },
        flash: {
            parseUBB: function(node, sonString, setting) {
                return sonString ? ('<img class="gui-ubb-flash" data-src="'+sonString+'" src="'+setting.flashImage+'" width="480" height="400"/>') : '';
            },
            canWrap: 0,
            isBlock: 0
        },
        blockquote: {
            parseHTML: function(nodeName, node, re) {
                if (nodeName === 'blockquote') {
                    re.prefix = '[blockquote]' + (re.prefix || '');
                    re.suffix = (re.suffix || '') + '[/blockquote]';
                }
            },
            parseUBB: function(node, sonString, setting) {
                return '<blockquote>' + sonString + '</blockquote>';
            },
            canContains: '*',
            canWrap: 1,
            isBlock: 1
        },
        ul: {
            parseHTML: function(nodeName, node, re) {
                if (nodeName === 'ul') {
                    re.prefix = '[ul]\n' + (re.prefix || '');
                    re.suffix = (re.suffix || '') + '\n[/ul]';
                }
            },
            parseUBB: function(node, sonString, setting) {
                var i = 0,
                    strs = sonString.split('<br/>'),
                    j = strs[0] ? 0 : 1,
                    l = strs[strs.length-1] ? 0 : -1,
                    newStrs = [];
                l += strs.length;
                for (; j<l; i++, j++) {
                    newStrs[i] = strs[j];
                }
                return '<ul><li>' + newStrs.join('</li><li>') + '</li></ul>';
            },
            canContains: '*',
            canWrap: 1,
            isBlock: 1
        },
        ol: {
            parseHTML: function(nodeName, node, re) {
                if (nodeName === 'ol') {
                    re.prefix = '[ol]\n' + (re.prefix || '');
                    re.suffix = (re.suffix || '') + '\n[/ol]';
                }
            },
            parseUBB: function(node, sonString, setting) {
                var i = 0,
                    strs = sonString.split('<br/>'),
                    j = strs[0] ? 0 : 1,
                    l = strs[strs.length-1] ? 0 : -1,
                    newStrs = [];
                l += strs.length;
                for (; j<l; i++, j++) {
                    newStrs[i] = strs[j];
                }
                return '<ol><li>' + newStrs.join('</li><li>') + '</li></ol>';
            },
            canContains: '*',
            canWrap: 1,
            isBlock: 1
        },
        ref: {
            parseHTML: function(nodeName, node, re) {
                if (nodeName === 'div' && node.className === 'gui-ubb-ref') {
                    re.prefix = '[ref]' + (re.prefix || '');
                    re.suffix = (re.suffix || '') + '[/ref]';
                }
            },
            parseUBB: function(node, sonString, setting) {
                return '<div class="gui-ubb-ref">' + sonString + '</div>';
            },
            canWrap: 0,
            isBlock: 1
        }
    });
})();
