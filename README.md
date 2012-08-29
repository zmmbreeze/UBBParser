UBBParser is awesome a UBB code parser in javascript.
It is highly flexiable and easy to custom. It support all mayjor desktop browser.

#License
MIT.
Be pleasure to fork and modify it.

#Feathure:
Convert UBB string to HTML string;
Convert HTML element to UBB string, parse by element style not html string;
Auto correct UBB string;
Custom your own UBB tag;

#Require:
jQuery (1.4.4+);

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
                    canWrap: 0,
                    isBlock: 1,
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
When convert HTML elements to UBB string, UBBParser can deal with whitespace and newline even in pre style.
But because of IE 6/7/8's bug, it's not work very well in this situation.
