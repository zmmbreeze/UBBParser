/**
 * UBBParser
 * @author mzhou / @zhoumm
 * @log 0.1 finish HTMLtoUBB
 *      0.2 finish UBBtoHTML
 *      0.3 fix inline/inline-block and br bug in HTMLtoUBB
 *      0.4 support white-space:pre except IE 678
 *      0.5 clear useless code
 *          remove jquery require
 *          fix UBBtoHTML whitespace convert to &nbsp;
 *          seperate tagParser
 *      0.6 add selection support
 */


/*jshint undef:true, browser:true, noarg:true, curly:true, regexp:true, newcap:true, trailing:false, noempty:true, regexp:false, strict:true, evil:true, funcscope:true, iterator:true, loopfunc:true, multistr:true, boss:true, eqnull:true, eqeqeq:false, undef:true */
/*global*/

var UBB = (function () {
    'use strict';
    var Tree = {
            clone: function(node, withChildNode) {
                if (!withChildNode) {
                    withChildNode = node;
                    node = this;
                }

                if (!node.isNode) {
                    return null;
                }
                if (withChildNode) {
                    var i,l,
                        newNode = node.clone();
                    for (i=0,l=node.length; i<l; i++) {
                        if (node[i].isNode) {
                            newNode.append(node[i].clone(true));
                        }
                    }
                    return newNode;
                } else {
                    return Tree.createNode(node.name, node.attr);
                }
            },
            append: function(father, son) {
                if (!son) {
                    son = father;
                    father = this;
                }
                if (!son) {
                    return father;
                }
                if (son.parent) {
                    throw 'Node ' + son.name + ' has a parent node!';
                }
                father.push(son);
                son.parent = father;
                return father;
            },
            getDeepestChild: function(node) {
                var next;
                while (next = node[node.length-1]) {
                    node = next;
                }
                return node;
            },
            createNode: function(name, attr) {
                var n = [];
                n.isNode = true;
                n.append = Tree.append;
                n.clone = Tree.clone;
                // n.detach = Tree.detach;
                if (name) {
                    n.name = name;
                }
                if (attr) {
                    n.attr = attr;
                }
                return n;
            },
            createTextNode: function(text) {
                var textNode = Tree.createNode('#text');
                textNode.value = text;
                return textNode;
            },
            createCursorNode: function() {
                var cursorNode = Tree.createNode('#cursor');
                cursorNode.value = '';
                return cursorNode;
            }
        },
        upperReg = /([A-Z])/g,
        dashReg = /-([a-z])/g,
        numReg = /^-?\d/,
        numpxReg = /^-?\d+(?:px)?$/i,
        ubbTagNameReg = /\[(\/)?([a-zA-Z]+)/,
        /*
         * Custom tags
         */
        tagsParser = {},
        blockStyle = {
            'block': 1,                             // div/p
            'table': 1,                             // table
            'table-caption': 1,                     // caption
            'table-footer-group': 1,                // tfoot
            'table-header-group': 1,                // thead
            'table-row': 1,                         // tr
            'table-row-group': 1,                   // tbody
            'list-item': 1                          // li
        },
        replacedElement = {
            'img': 1,
            'object': 1,
            'button': 1,
            'textarea': 1,
            'input': 1,
            'select': 1
        },
        preStyle = {
            'pre': 1,
            'pre-wrap': 1,
            'pre-line': 1
        },
        spaceStyle = {
            'pre': 1,
            'pre-wrap': 1
        },
        Util = {
            /**
             * is inline-block element. In IE6/7 inline replacedElement act like inline-block.
             * Can't deal with haslayout, sad.
             * @param {object} node jquery object
             * @return {boolean}
             */
            isInlineBlock: function(node, nodeName) {
                var display = Util.getComputedStyle(node, 'display');
                return !!(display === 'inline-block' || (display === 'inline' && replacedElement[nodeName]));
            },
            /**
             * if node is block a line.
             * @param {object} node jquery object
             * @return {boolean}
             */
            hasBlockBox: function(node) {
                return !!(blockStyle[Util.getComputedStyle(node, 'display')]);
            },
            /**
             * if node is keep new line
             * @param {object} node jquery object
             * @return {number}
             *                  0 not keep new line
             *                  1 keep new line except last one
             *                  2 keep new line except first and last one
             */
            isKeepNewLine: function(node, nodeName) {
                if (nodeName === 'pre' || nodeName === 'textarea') {
                    return 2;
                }
                if (preStyle[Util.getComputedStyle(node, 'white-space')]) {
                    return 1;
                }
                return 0;
            },
            /**
             * if node is keep white space
             * @param {object} node jquery object
             * @return {boolean}
             */
            isKeepWhiteSpace: function(node) {
                return !!(spaceStyle[Util.getComputedStyle(node, 'white-space')]);
            },
            /**
             * escape '[' and ']' to '\[' and '\]'
             * @param string str html string
             * @return string escaped string
             */
            ubbEscape: function(str) {
                return str.replace(/(\[|\])/g, '\\$1');
            },
            /**
             * change text state
             *
             *         0: nothing
             *         1: text and inline-block element
             *         2: br, or block element(height==0)
             *         3: block element
             *
             *              text 1   |  br 2     |   block element 3 |  inline 4 |  pre string trim '\n' 5 |  pre string only trim start '\n' 6 | string only trim end '\n' 7 | not trim '\n' 8
             *         0 |  1/false  |  2/false  |   3/false         |  0/false     2/false                |  1/false                           | 2/false                     | 1/false
             *         1 |  1/false  |  2/false  |   3/true          |  1/false     NaN                    |  NaN                               | 2/false                     | 1/false
             *         2 |  1/true   |  2/true   |   3/true          |  2/false     NaN                    |  NaN                               | 2/true                      | 1/true
             *         3 |  1/true   |  2/true   |   3/true          |  3/false     NaN                    |  NaN                               | 2/true                      | 1/true
             *
             * @param {object} boxState
             * @param {number} incomming incomming element type
             */
            changeState: function(boxState, incomming, re) {
                var node = boxState.node,
                    key = boxState.key,
                    count,
                    newLineRules = {
                        0: {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0},
                        1: {1:0, 2:0, 3:1, 4:0,           7:0, 8:0},
                        2: {1:1, 2:1, 3:1, 4:0,           7:1, 8:1},
                        3: {1:1, 2:1, 3:1, 4:0,           7:1, 8:1}
                    },
                    convertRules = {
                        1: 1,
                        2: 2,
                        3: 3,
                        5: 2,
                        6: 1,
                        7: 2,
                        8: 2
                    };

                count = newLineRules[key][incomming];
                if (count && node) {
                    // add new line
                    node.suffix = (node.suffix || '') + (count == 1 ? '\n' : '\n\n');
                }
                if (incomming in convertRules) {
                    boxState.key = convertRules[incomming];
                }
                boxState.node = re;
            },
            /**
             * parse jquery node to ubb text
             * @param {object} node jquery object
             * @param {string} nodeName
             * @param {string} nodeType
             * @param {object} setting
             * @param {object} re
             * @param {object} state
             * @return {string} ubb text of node and it's children
             */
            parseNode: function(node, nodeName, nodeType, setting, re, state) {
                var tagName, tagParser, text,
                    keepNewLine, keepWhiteSpace,
                    trimStartNewLine, trimEndNewLine,
                    boxStates = state.boxStates,
                    textStates = state.textStates,
                    boxState = boxStates[boxStates.length - 1],
                    textState = textStates[textStates.length - 1];

                switch(nodeType) {
                // comments
                case 8:
                    return;
                // text
                case 3:
                    text = node.nodeValue.replace(/\r\n/g, '\n');
                    keepNewLine = textState.keepNewLine;
                    keepWhiteSpace = textState.keepWhiteSpace;

                    if (!keepNewLine) {
                        // trim \n
                        // \n ==> ''
                        text = text.replace(/^\n|\n$/g, '')
                                   .replace(/\n/g, ' ');
                    }

                    if (!keepWhiteSpace) {
                        // whitespace == \u0020, charCode == 32
                        // zero advance width space == \u200B
                        // fixed-width spaces == \u200A || \u3000 || \u2000
                        // non-breaking space(&nbsp;) == \u00A0, charCode == 160

                        // trim whitespace
                        // collapse whitespace
                        // keep nont-breaking space
                        text = text.replace(/^[\u0020\u200B\u200A\u3000\u2000]*|[\u0020\u200B\u200A\u3000\u2000]*$/g, '')
                                   .replace(/[\u0020\u200B\u200A\u3000\u2000]{2,}/g, ' ');
                    }

                    text = Util.ubbEscape(text);
                    if (text === '') {
                        return;
                    }

                    trimStartNewLine = (keepNewLine === 2) && (text.slice(0, 1) === '\n') && (boxState.key === 0);
                    trimEndNewLine = keepNewLine && (text.length > 1) && (text.slice(-1) === '\n');

                    if (!keepWhiteSpace) {
                        re.text = text;
                        // not keep new line
                        Util.changeState(boxState, 1, re);
                    } else {
                        if (text === '\n') {
                            re.text = '';
                            if (trimStartNewLine) {
                                // ignore first '\n'
                                Util.changeState(boxState, 6, re);
                            } else {
                                // keep '\n'
                                Util.changeState(boxState, 8, re);
                            }
                        } else {
                            if (trimStartNewLine && trimEndNewLine) {
                                // \naaaa\n or \n\n
                                re.text = text.slice(1, -1);
                                Util.changeState(boxState, 5, re);
                            } else if (trimStartNewLine) {
                                // \naaaa
                                re.text = text.slice(1);
                                Util.changeState(boxState, 6, re);
                            } else if (trimEndNewLine) {
                                // aaaa\n
                                re.text = text.slice(0, -1);
                                Util.changeState(boxState, 7, re);
                            } else {
                                // aaaa
                                re.text = text;
                                Util.changeState(boxState, 1, re);
                            }
                        }
                    }
                    break;
                // element
                case 1:
                    if (nodeName === 'br') {
                        // br
                        Util.changeState(boxState, 2, re);
                    } else {
                        if (re.hasBlockBox) {
                            if (node.offsetHeight > 0) {
                                // block element
                                Util.changeState(boxState, 3, re);
                            } else {
                                // <div></div>
                                Util.changeState(boxState, 2, re);
                            }
                        } else {
                            // inline element
                            Util.changeState(boxState, Util.isInlineBlock(node, nodeName) ? 1 : 4, re);
                        }
                    }
                    break;
                default:
                    break;
                }

                for (tagName in setting.tags) {
                    tagParser = setting.tags[tagName];
                    if (tagParser.parseHTML) {
                        tagParser.parseHTML(nodeName, node, re, setting);
                    }
                }

                return re;
            },
            /**
             * convert abstract node tree to UBB string
             * @param {object} re root abstract node
             * @return {string} UBB string
             */
            treeToUbb: function(re) {
                var i, l, child,
                    texts = [(re.prefix || '')];
                // is text
                if (re.text) {
                    texts.push(re.text);
                }
                // has children
                for (i=0,l=re.length; i<l; i++) {
                    child = re[i];
                    texts.push(Util.treeToUbb(child));
                }
                texts.push(re.suffix || '');
                return texts.join('');
            },
            /**
             * can father contains son
             * @param {object} father father tag
             * @param {object} son son tag
             * @param {object} ubbTagsOrder prioritys for all tags
             * @return {boolean}
             */
            canContains: function(father, son, ubbTagsOrder) {
                if (father.isRoot || son.name === '#cursor') {
                    return true;
                }
                if (father.name === '#cursor') {
                    return false;
                }
                var canContainsTags = ubbTagsOrder[father.name];
                return typeof canContainsTags === 'boolean' ? canContainsTags : canContainsTags[son.name];
            },
            /**
             * push open ubb tag into stack
             * @param {array} node
             * @param {object} tag tags to be push
             * @param {object} ubbTagsOrder
             */
            pushOpenUbbTag: function(node, tag, ubbTagsOrder) {
                var autoClosedNode;
                while (!Util.canContains(node, tag, ubbTagsOrder)) {
                    if (autoClosedNode) {
                        autoClosedNode = node.clone().append(autoClosedNode);
                    } else {
                        autoClosedNode = node.clone();
                    }
                    node = node.parent;
                }

                node.append(tag);
                // if has autoClosedNode and tag can contains them, then complete immediately
                if (autoClosedNode && Util.canContains(tag, autoClosedNode, ubbTagsOrder)) {
                    tag.append(autoClosedNode);
                    return Tree.getDeepestChild(autoClosedNode);
                // or complete later
                } else {
                    return tag;
                }
            },
            /**
             * push close ubb tag into stack
             * @param {array} node
             * @param {string} tagName
             */
            pushCloseUbbTag: function(node, tagName) {
                var autoClosedNode;
                while (!node.isRoot && node.name !== tagName) {
                    if (autoClosedNode) {
                        autoClosedNode = node.clone().append(autoClosedNode);
                    } else {
                        autoClosedNode = node.clone();
                    }
                    node = node.parent;
                }

                if (node.isRoot) {
                    // ignore this tag
                    return node;
                } else {
                    // autoClose
                    node = node.parent;
                    node.append(autoClosedNode);
                    return autoClosedNode ? Tree.getDeepestChild(autoClosedNode) : node;
                }
            },
            /**
             * push '\n'
             * @param {object} node
             * @param {object} wrapUbbTags canWrap value
             */
            pushLineUbbTag: function(node, wrapUbbTags) {
                var autoClosedNode;
                while (!node.isRoot && !wrapUbbTags[node.name]) {
                    if (autoClosedNode) {
                        autoClosedNode = node.clone().append(autoClosedNode);
                    } else {
                        autoClosedNode = node.clone();
                    }
                    node = node.parent;
                }

                node.append(Tree.createTextNode('\n'));
                // if can contains then complete immediately
                node.append(autoClosedNode);
                return autoClosedNode ? Tree.getDeepestChild(autoClosedNode) : node;
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
             * @param {object} ubbTagsOrder
             * @param {object} wrapUbbTags
             * @param {boolean} needEncodeHtml
             * @param {object} selection object descript the selection range
             *                              {start: 10, end: 100}
             *                              by default is {start: 0, end: 0}
             * @return {array} tag list
             */
            scanUbbText: function(text, setting, needEncodeHtml, selection) {
                // encode html
                if (needEncodeHtml) {
                    text = Util.htmlEncode(text);
                }
                text = text.replace(/\r\n/g, '\n'); // for IE hack
                var c, r, tagName, tag, prevOpenTag, attr, isClose,
                    ubbTagsOrder = setting.ubbTagsOrder,
                    wrapUbbTags = setting.wrapUbbTags,
                    // state value represent next char not be escape
                    NORMAL = 0,
                    // state value represent next char should be escape
                    ESCAPE = 1,
                    // state value represent buf is a tag name not normal text
                    PROCESSINGTAG = 2,
                    // state value represent need to append start cursor after appended a normal tag
                    APPENDSTARTCURSOR = 3,
                    // state value represent need to append end cursor after appended a normal tag
                    APPENDENDCURSOR = 4,
                    // state value represent need to append start and end cursor after appended a normal tag
                    APEENDCURSORS = 5,
                    // state value
                    state = NORMAL,
                    i = 0,
                    l = text.length,
                    selectionStart = selection ? (selection.start || 0) : 0,
                    selectionEnd = selection ? (selection.end || selectionStart) : 0,
                    buf = '',
                    root = Tree.createNode(),
                    node = root;
                // mark root
                root.isRoot = true;
                // validate selection
                if (selectionEnd < selectionStart) {
                    throw new Error('UBBtoHTML(): selection end cursor was before start cursor.');
                }
                // do scan
                for(; i<l; i++) {
                    // push start cursor
                    if (i === selectionStart) {
                        // not processing tag
                        // then push start cursor tag
                        if (state !== PROCESSINGTAG) {
                            if (buf) {
                                node.append(Tree.createTextNode(buf));
                                buf = '';
                            }
                            node = Util.pushOpenUbbTag(node, Tree.createCursorNode(), ubbTagsOrder);
                        } else {
                            state = APPENDSTARTCURSOR;
                        }
                    }
                    // push end cursor
                    if (i === selectionEnd) {
                        // not processing tag or need to append start cursor
                        // then push end cursor tag
                        if (state !== PROCESSINGTAG && state !== APPENDSTARTCURSOR) {
                            if (buf) {
                                node.append(Tree.createTextNode(buf));
                                buf = '';
                            }
                            node = Util.pushCloseUbbTag(node, '#cursor');
                        } else {
                            state = state === APPENDSTARTCURSOR ? APEENDCURSORS : APPENDENDCURSOR;
                        }
                    }

                    // push normal tags / text / \n
                    c = text.charAt(i);
                    switch(c) {
                    case '\\':
                        state = ESCAPE;
                        break;
                    case '[':
                        if (state === ESCAPE) {
                            buf += '[';
                            state = NORMAL;
                        } else {
                            if (buf) {
                                node.append(Tree.createTextNode(buf));
                            }
                            buf = '[';
                            state = PROCESSINGTAG;
                        }
                        break;
                    case ']':
                        if (state === ESCAPE) {
                            buf += ']';
                        } else {
                            r = ubbTagNameReg.exec(buf);
                            // is tag
                            if (r && r[2] && ((tagName = r[2].toLowerCase()) in ubbTagsOrder)) {
                                // new tag
                                isClose = !!r[1];
                                if (!isClose) {
                                    attr = buf.slice(r[2].length + (r[1] ? 2 : 1));
                                    tag = Tree.createNode(tagName, attr);
                                }

                                // close
                                if (isClose) {
                                    node = Util.pushCloseUbbTag(node, tagName);
                                // open
                                } else {
                                    node = Util.pushOpenUbbTag(node, tag, ubbTagsOrder);
                                }
                            // not tag
                            } else {
                                node.append(Tree.createTextNode(buf + ']'));
                            }
                            buf = '';

                            // append start cursor
                            if (state === APPENDSTARTCURSOR || state === APEENDCURSORS) {
                                node = Util.pushOpenUbbTag(node, Tree.createCursorNode(), ubbTagsOrder);
                            }
                            // append end cursor
                            if (state === APPENDENDCURSOR || state === APEENDCURSORS) {
                                node = Util.pushCloseUbbTag(node, '#cursor');
                            }
                        }
                        state = NORMAL;
                        break;
                    case '\n':
                        if (state === ESCAPE) {
                            state = NORMAL;
                        }
                        if (buf) {
                            node.append(Tree.createTextNode(buf));
                            buf = '';
                        }
                        node = Util.pushLineUbbTag(node, wrapUbbTags);
                        break;
                    default:
                        if (state === ESCAPE) {
                            state = NORMAL;
                        }
                        buf += c;
                        break;
                    }
                }
                if (buf) {
                    node.append(Tree.createTextNode(buf));
                }

                return root;
            },
            /**
             * parse ubb node to ubb text
             * @param {object} node ubb node
             * @param {string} sonString the ubb text of node's children
             * @param {object} setting
             * @param {object} state
             * @return {string} html text of node and it's children
             */
            parseUbbNode: function(node, sonString, setting, state) {
                var tagsParser = setting.tags,
                    tagInfo;
                switch(node.name) {
                case '#text':
                    if (node.value === '\n') {
                        if (state.nobr) {
                            state.nobr = false;
                            return '';
                        } else {
                            return '<br/>';
                        }
                    } else {
                        state.nobr = false;
                        return node.value.replace(/\s/g, '&nbsp;');
                    }
                    break;
                case '#cursor':
                    return setting.selectionPrefix + sonString + setting.selectionSuffix;
                default:
                    if ((tagInfo = tagsParser[node.name]) && tagInfo.parseUBB) {
                        if (tagInfo.isBlock) {
                            state.nobr = true;
                        }
                        return tagInfo.parseUBB(node, sonString, setting);
                    }
                    break;
                }
            },
            /**
             * fix ubb node to ubb text
             * @param {object} node ubb node
             * @param {string} sonString the ubb text of node's children
             * @param {object} setting
             * @return {string} ubb text of node and it's children
             */
            fixUbbNode: function(node, sonString, setting) {
                switch(node.name) {
                case '#text':
                    return Util.ubbEscape(node.value);
                case '#cursor':
                    return sonString;
                default:
                    return '['+node.name+(node.attr || '')+']'+sonString+'[/'+node.name+']';
                }
            }
        },
        /**
         * parse jquery node into html
         * @param {object} node dom object, must be a block element
         * @param {object} setting
         * @param {object} parent jquery object
         * @return {string} ubb text
         */
        parseHtml = function(node, setting, state, notRoot) {
            var i, l, j, jl, child,
                re = Tree.createNode(),
                nodeType = node.nodeType,
                nodeName = node.nodeName.toLowerCase(),
                children = node.childNodes;
            // init
            if (!state) {
                state = {};
                state.boxStates = [];      // record the block box state
                state.textStates = [];     // record the text state: keepNewLine and keepWhiteSpace
            }

            // push state
            if (nodeType === 1) {
                // element has block box
                if (Util.hasBlockBox(node)) {
                    state.boxStates.push({
                        key: 0,
                        node: null
                    });
                    re.hasBlockBox = true;
                }
                state.textStates.push({
                    keepNewLine: Util.isKeepNewLine(node, nodeName),
                    keepWhiteSpace: Util.isKeepNewLine(node)
                });
            }

            // parse children
            for (i=0,l=children.length; i<l; i++) {
                child = parseHtml(children[i], setting, state, true);
                // add relationship
                if (child) {
                    re.append(child);
                }
            }

            // pop state
            if (nodeType === 1) {
                state.textStates.pop();
            }
            if (re.hasBlockBox) {
                state.boxStates.pop();
            }

            // make sure container not to be parsed
            if (notRoot) {
                return Util.parseNode(node, nodeName, nodeType, setting, re, state);
            } else {
                // change tree to ubb string
                return Util.treeToUbb(re);
            }
        },
        /**
         * parse ubb text into html text
         * @param {object} node
         * @param {object} setting
         * @param {object} state
         * @return {string} html text
         */
        parseUbb = function(node, setting, state) {
            var i, l,
                re = [];
            state = state || {};

            if (node.isNode) {
                for (i=0,l=node.length; i<l; i++) {
                    re.push(parseUbb(node[i], setting, state));
                }
            }

            // root node has no meaning
            if (!node.isRoot) {
                return Util.parseUbbNode(node, re.join(''), setting, state);
            } else {
                return re.join('');
            }
        },
        /**
         * auto complete ubb string
         * fix error placed tags
         * @param {object} node
         * @param {object} setting
         * @param {object} state
         * @return {string} fixed ubb string
         */
        fixUbb = function(node, setting, state) {
            var i, l,
                re = [];
            state = state || {};

            if (node.isNode) {
                for (i=0,l=node.length; i<l; i++) {
                    re.push(fixUbb(node[i], setting, state));
                }
            }

            // root node has no meaning
            if (!node.isRoot) {
                return Util.fixUbbNode(node, re.join(''), setting, state);
            } else {
                return re.join('');
            }
        };


    /**
     * get css style
     * copy from jquery src: https://github.com/jquery/jquery/blob/1.4.4/src/css.js
     *
     * @param {object} node dom element
     * @param {string} cssStyleName
     * @return {string} style
     */
    if (document.defaultView && document.defaultView.getComputedStyle) {
        Util.getComputedStyle = function(node, cssStyleName) {
            var computedStyle, re,
                defaultView = node.ownerDocument.defaultView;
            if (!defaultView) {
                return;
            }
            cssStyleName = cssStyleName.replace(upperReg, '-$1').toLowerCase();
            computedStyle = defaultView.getComputedStyle(node, null);
            if (computedStyle) {
                re = computedStyle.getPropertyValue(cssStyleName);
            }
            return re;
        };
    } else {
        Util.getComputedStyle = function(node, cssStyleName) {
            cssStyleName = cssStyleName.replace(dashReg, function($1) {
                return $1.charAt(1).toUpperCase();
            });
            var left, rsLeft,
                re = node.currentStyle && node.currentStyle[ cssStyleName ],
                style = node.style;

            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            if ( !numpxReg.test( re ) && numReg.test( re ) ) {
                // Remember the original values
                left = style.left;
                rsLeft = node.runtimeStyle.left;

                // Put in the new values to get a computed value out
                node.runtimeStyle.left = node.currentStyle.left;
                style.left = cssStyleName === 'fontSize' ? '1em' : (re || 0);
                re = style.pixelLeft + 'px';

                // Revert the changed values
                style.left = left;
                node.runtimeStyle.left = rsLeft;
            }

            return re === '' ? 'auto' : re.toString();
        };
    }

    /**
     *  var ubbParser = new UBB();
     *  @param {object} setting
     */
    function UBB(setting) {
        this.setting = UBB.mix({
                selectionPrefix: '',
                selectionSuffix: ''
            }, setting);
        this.setting.tags = UBB.mix(tagsParser, this.setting.tags);
        this.setting.ubbTagsOrder = {};
        this.setting.wrapUbbTags = {};
        // generate tag ubbTagsOrder and wrapUbbTags
        //      ubbTagsOrder:
        //          {
        //              blockquote: true,       // can contain every tags
        //              image: false,           // can't contain tag include self
        //              bold: {                 // can contain bold and image tag
        //                  bold: true,
        //                  image: true
        //              }
        //          }
        //      wrapUbbTags:
        //          {
        //              blockquote: 1,          // can contain new line
        //              bold: 0,                // can't contain new line
        //              image: 0                // can't contain new line
        //          }
        var k, v, i, l, tagNames, order;
        setting = this.setting;
        for (k in setting.tags) {
            v = setting.tags[k];
            switch (v.canContains) {
            case '*':
                setting.ubbTagsOrder[k] = true;
                break;
            case '':
                setting.ubbTagsOrder[k] = false;
                break;
            case undefined:
                setting.ubbTagsOrder[k] = false;
                break;
            default:
                tagNames = v.canContains.split(',');
                order = {};
                for (i=0,l=tagNames.length; i<l; i++) {
                    order[tagNames[i].toLowerCase()] = true;
                }
                setting.ubbTagsOrder[k] = order;
                break;
            }
            setting.wrapUbbTags[k] = v.canWrap;
        }
    }
    /**
     * Util.extend(obj, {newMethod: 'a'});
     * @param {object} object
     * @param {object} source
     */
    UBB.extend = function(object, source) {
        var method;
        for (method in source) {
            if (source.hasOwnProperty(method)) {
                object[method] = source[method];
            }
        }
    };
    /**
     * add or modify tags
     * @param {object} tags
     */
    UBB.addTags = function(tags) {
        UBB.extend(tagsParser, tags);
    };
    /**
     * obj = Util.mix({method: 'b'}, {newMethod: 'a'});
     * @param {object} object
     * @param {object} object2
     * @return {object} newObject
     */
    UBB.mix = function(object, object2) {
        var method,
            re = {};
        UBB.extend(re, object);
        UBB.extend(re, object2);
        return re;
    };
    UBB.Util = Util;
    /**
     * @param {object} dom dom object must be a block element
     * @return {string} ubb text
     */
    UBB.prototype.HTMLtoUBB = function (dom) {
        if (dom.nodeType === 1 ) {
            return this.fixUBB(parseHtml(dom, this.setting));
        } else {
            return '';
        }
    };
    /**
     * @param {string} ubb text
     * @return {string} html text
     */
    UBB.prototype.UBBtoHTML = function(ubb, selection) {
        return parseUbb(Util.scanUbbText(ubb, this.setting, true, selection), this.setting);
    };
    /**
     * fix error ubb text
     * @param {string} ubb text
     * @return {string} fixed ubb text
     */
    UBB.prototype.fixUBB = function(ubb) {
        return fixUbb(Util.scanUbbText(ubb, this.setting), this.setting);
    };
    return UBB;
})();
