UBBParser is a UBB code parser writing in javascript.
It is highly flexible and easy to custom. Support major desktop browser like IE 6+,Firefox10+,Safari5+,Opera,Chrome.

#License
MIT.
Be pleasure to fork and modify it.

#Feature:
Convert UBB string to HTML string;
Convert HTML element to UBB string, parse by element style not html string;
Auto correct UBB string;
Custom your own UBB tag;

#Demo:
    
    var parser = new UBB({
            defaultColor: '#000000',            // [option] color of all text element
            linkDefaultColor: '#006699',        // [option] color of a elment
            flashImage: '/skin/imgs/flash.png', // [option] flash image to show
            tags: {
                newtagname: {
                    parseHTML: function(nodeName, node, re) {
                        // define which dom node to convert
                        // node is a jquery object
                        if (nodeName === 'div' && node[0].className === 'gui-ubb-ref') {
                            // return prefix string
                            re.prefix = '[ref]' + (re.prefix || '');
                            // return suffix string
                            re.suffix = (re.suffix || '') + '[/ref]';
                        }
                    },
                    parseUBB: function(node, sonString, setting) {
                        // parser will find a matched tag for you
                        // return UBB string include sonString
                        return '<div class="gui-ubb-ref">' + sonString + '</div>';
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
                    isBlock: 0,
                    noAttr: 1
                }
            }
        });
    // convert HTML element to UBB string
    parser.HTMLtoUBB($('#container'));
    // convert UBB string to HTML string
    parser.UBBtoHTML('[bold]aaa[/bold]');
    // auto correct UBB string
    parser.fixUBB('[bold]aaa');   // ==> echo [bold]aaa[/bold]

Please check index.html for detail.

#NOTE:
When converting HTML elements to UBB string, UBBParser can deal with whitespace and newline in pre style. But in case of IE 6/7/8's bug, it's not work very well in this situation.
