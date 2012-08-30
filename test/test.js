
/*jshint undef:true, browser:true, noarg:true, curly:true, regexp:true, newcap:true, trailing:false, noempty:true, regexp:false, strict:false, evil:true, funcscope:true, iterator:true, loopfunc:true, multistr:true, boss:true, eqnull:true, eqeqeq:false, undef:false*/

describe('ubb.js:', function() {
    beforeEach(function() {
        jasmine.Clock.useMock();
    });

    it('Util Test: getComputedStyle', function() {
        runs(function() {
            var $html = $('#html2');
            function css(styleName, value) {
                var re, defaultCSS;
                defaultCSS = $html.css(styleName);
                $html.css(styleName, value);
                re = UBB.Util.getComputedStyle($html[0], styleName);
                $html.css(styleName, defaultCSS);
                return re;
            }
            if (jQuery.browser.msie) {
                expect(css('font-weight', 'bold')).toEqual('700');
            } else {
                expect(css('font-weight', 'bold')).toEqual('bold');
            }
            expect(css('font-weight', '100')).toEqual('100');
            expect(css('font-style', 'italic')).toEqual('italic');
            expect(UBB.Util.RGBtoHEX(css('color', '#000'))).toEqual('#000000');
            expect(css('display', 'inline')).toEqual('inline');
            expect(css('display', 'block')).toEqual('block');
            if (jQuery.browser.msie && (parseInt(jQuery.browser.version, 10) < 7)) {
                expect(css('display', 'inline-block')).toEqual('inline-block');
            }
            expect(css('white-space', 'pre')).toEqual('pre');
            expect(css('white-space', 'normal')).toEqual('normal');
            expect(css('white-space', 'nowrap')).toEqual('nowrap');
        });
    });

    it('UBBtoHTML: normal tag', function() {
        runs(function() {
            var ubb = new UBB({
                defaultColor: '#333333',
                linkDefaultColor: '#006688',
                flashImage: 'test.jpg'
            });
            var re = ubb.UBBtoHTML('[bold]bold[/bold]');
            expect(re).toEqual('<b>bold</b>');
            re = ubb.UBBtoHTML('[italic]italic[/italic]');
            expect(re).toEqual('<i>italic</i>');
            re = ubb.UBBtoHTML('[color=blue]blue[/italic]');
            expect(re).toEqual('<span style="color:blue;">blue</span>');
            re = ubb.UBBtoHTML('[url href=http://www.guokr.com]guokr.com[/url]');
            expect(re).toEqual('<a href="http://www.guokr.com">guokr.com</a>');
            re = ubb.UBBtoHTML('[image]http://guokr.com/skin/imgs/flash.jpg[/image]');
            expect(re).toEqual('<img src="http://guokr.com/skin/imgs/flash.jpg"/>');
            re = ubb.UBBtoHTML('[video]http://player.youku.com/player.php/sid/XNDMwNDEzMjc2/v.swf[/video]');
            expect(re).toEqual('<img class="gui-ubb-flash" data-src="http://player.youku.com/player.php/sid/XNDMwNDEzMjc2/v.swf" src="test.jpg" width="480" height="400"/>');
            re = ubb.UBBtoHTML('[flash]http://player.youku.com/player.php/sid/XNDMwNDEzMjc2/v.swf[/flash]');
            expect(re).toEqual('<img class="gui-ubb-flash" data-src="http://player.youku.com/player.php/sid/XNDMwNDEzMjc2/v.swf" src="test.jpg" width="480" height="400"/>');
            re = ubb.UBBtoHTML('[blockquote]\nThis is a blockquote!\nAnd it is awesome!\n[/blockquote]');
            expect(re).toEqual('<blockquote><br/>This&nbsp;is&nbsp;a&nbsp;blockquote!<br/>And&nbsp;it&nbsp;is&nbsp;awesome!<br/></blockquote>');
            re = ubb.UBBtoHTML('[ul]\nThis is a ul!\nAnd it is awesome!\n[/ul]');
            expect(re).toEqual('<ul><li>This&nbsp;is&nbsp;a&nbsp;ul!</li><li>And&nbsp;it&nbsp;is&nbsp;awesome!</li></ul>');
            re = ubb.UBBtoHTML('[ul]This is a ul!\nAnd it is awesome![/ul]');
            expect(re).toEqual('<ul><li>This&nbsp;is&nbsp;a&nbsp;ul!</li><li>And&nbsp;it&nbsp;is&nbsp;awesome!</li></ul>');
            re = ubb.UBBtoHTML('[ul]\nThis is a ul!\nAnd it is awesome![/ul]');
            expect(re).toEqual('<ul><li>This&nbsp;is&nbsp;a&nbsp;ul!</li><li>And&nbsp;it&nbsp;is&nbsp;awesome!</li></ul>');
            re = ubb.UBBtoHTML('[ul]This is a ul!\nAnd it is awesome!\n[/ul]');
            expect(re).toEqual('<ul><li>This&nbsp;is&nbsp;a&nbsp;ul!</li><li>And&nbsp;it&nbsp;is&nbsp;awesome!</li></ul>');
            re = ubb.UBBtoHTML('[ol]\nThis is a ol!\nAnd it is awesome!\n[/ol]');
            expect(re).toEqual('<ol><li>This&nbsp;is&nbsp;a&nbsp;ol!</li><li>And&nbsp;it&nbsp;is&nbsp;awesome!</li></ol>');
            re = ubb.UBBtoHTML('[ol]This is a ol!\nAnd it is awesome![/ol]');
            expect(re).toEqual('<ol><li>This&nbsp;is&nbsp;a&nbsp;ol!</li><li>And&nbsp;it&nbsp;is&nbsp;awesome!</li></ol>');
            re = ubb.UBBtoHTML('[ol]This is a ol!\nAnd it is awesome!\n[/ol]');
            expect(re).toEqual('<ol><li>This&nbsp;is&nbsp;a&nbsp;ol!</li><li>And&nbsp;it&nbsp;is&nbsp;awesome!</li></ol>');
            re = ubb.UBBtoHTML('[ol]\nThis is a ol!\nAnd it is awesome![/ol]');
            expect(re).toEqual('<ol><li>This&nbsp;is&nbsp;a&nbsp;ol!</li><li>And&nbsp;it&nbsp;is&nbsp;awesome!</li></ol>');
            re = ubb.UBBtoHTML('[ref]http://www.guokr.com/article/176586/[/ref]\nAfter ref!');
            expect(re).toEqual('<div class="gui-ubb-ref">http://www.guokr.com/article/176586/</div>After&nbsp;ref!');
            re = ubb.UBBtoHTML('[ref]http://www.guokr.com/\narticle/176586/[/ref]\nAfter ref!');
            expect(re).toEqual('<div class="gui-ubb-ref">http://www.guokr.com/</div><div class="gui-ubb-ref">article/176586/</div>After&nbsp;ref!');
        });
    });

    it('HTMLtoUBB: normal tag', function() {
        runs(function() {
            var $html = $('#html'),
                ubb = new UBB({
                    defaultColor: '#333333',
                    linkDefaultColor: '#006688',
                    flashImage: 'test.jpg'
                });
            function toUbb(html) {
                $html.html(html);
                return ubb.HTMLtoUBB($html[0]);
            }
            var re = toUbb('<div>\
normal words!<b>bold</b> <span style="font-weight:bold;">bold</span> normal words! <i>italic</i> Test word~ <span style="font-style:italic;">italic</span> normal words! <a href="http://www.guokr.com/">guokr.com</a><br/>image:<br/><img src="http://guokr.com/skin/imgs/flash.jpg" /><br/>\
video:<br/><img class="gui-ubb-flash" data-src="http://player.youku.com/player.php/sid/XNDMwNDEzMjc2/v.swf" src="test.jpg" width="480" height="400"/>\
<ul>\
<li><i>italic</i></li>\
<li><a href="http://www.guokr.com/">guokr.com</a></li>\
</ul>\
<ol>\
<li><b>bold</b>test word</li>\
<li><b>bold</b></li>\
</ol>\
<blockquote>This is a blockquote!<br/>And it\'s awesome!</blockquote>\
<div class="gui-ubb-ref">http://www.guokr.com/</div>\
</div>');
            expect(re).toEqual('normal words![bold]bold[/bold][bold]bold[/bold]normal words![italic]italic[/italic]Test word~[italic]italic[/italic]normal words![url href=http://www.guokr.com/]guokr.com[/url]\n\
image:\n\
[image]http://guokr.com/skin/imgs/flash.jpg[/image]\n\
video:\n\
[video]http://player.youku.com/player.php/sid/XNDMwNDEzMjc2/v.swf[/video]\n\
[ul]\n\
[italic]italic[/italic]\n\
[url href=http://www.guokr.com/]guokr.com[/url]\n\
[/ul]\n\
[ol]\n\
[bold]bold[/bold]test word\n\
[bold]bold[/bold]\n\
[/ol]\n\
[blockquote]This is a blockquote!\n\
And it\'s awesome![/blockquote]\n\
[ref]http://www.guokr.com/[/ref]');
            re = toUbb('<p><br/></p><p><br/></p>');
            expect(re).toEqual('\n');
            re = toUbb('aaa<p><br/></p>bbb');
            expect(re).toEqual('aaa\n\nbbb');
            re = toUbb('<p>aaa<br/></p>');
            expect(re).toEqual('aaa');
            re = toUbb('<p><br/>aaa</p>');
            expect(re).toEqual('\naaa');
            re = toUbb('<div>aaa</div><br/>bbb');
            expect(re).toEqual('aaa\n\nbbb');
            re = toUbb('bbb<br/><div>aaa<div>');
            expect(re).toEqual('bbb\naaa');
            re = toUbb('<div><div><p></p></div></div>');
            expect(re).toEqual('');
            re = toUbb('<div><div><p><br/></p></div></div>');
            expect(re).toEqual('');
            re = toUbb('<p><img src="http://www.guokr.com/gkimage/jr/y1/zk/jry1zk.jpg" width="48" height="48" border="0" hspace="0" vspace="0">童话的世界中贫穷总是伴随着善<strong>良而乐于助人，富有</strong>的人常常拥有邪恶的嘴脸。<br>\
新闻的世<em>界中，富二代飞扬跋扈</em>，屌丝默默地做好事儿。<br>\
现实的世<img src="http://www.guokr.com/gkimage/jr/y1/zk/jry1zk.jpg" width="48" height="48" border="0" hspace="0" vspace="0">界中呢？<br>\
大家还记得可爱的Milgram老师吗？\
</p>\
<ol style="list-style-type:decimal;">\
<li>\
<p>\
就是津巴多老师的好机油，以电击实验（好吧，是权威服从实验）闻名于江湖的。\
</p>\
</li>\
<li>\
<p>\
他还做过好多奇形怪状充满想象力的实验。<br>\
</p>\
</li>\
<li>\
<p>\
比如把写好自己地址的明信片/信仍在大街上，等着看自己能回收多少封。。。。\
</p>\
</li>\
</ol>\
<p>\
<br>\
</p>\
<p>\
<br>\
</p>\
<p>\
<br>\
</p>\
<p>\
这真不是蛋疼，这个实验还是得出了不少有用的结论的。比如贴上邮票的回收率更高，离邮筒近的回收率更高。这说明好人做好事也需要条件，如果太不方便，就懒得做了。看似蛋疼地验证了一个常识，但是严谨地告诉我们一个道理：要想让世界上有更多好人好事，就要为好人好事创造条件。\
</p>');
            expect(re).toEqual('[image]http://www.guokr.com/gkimage/jr/y1/zk/jry1zk.jpg[/image]童话的世界中贫穷总是伴随着善[bold]良而乐于助人，富有[/bold]的人常常拥有邪恶的嘴脸。\n\
新闻的世[italic]界中，富二代飞扬跋扈[/italic]，屌丝默默地做好事儿。\n\
现实的世[image]http://www.guokr.com/gkimage/jr/y1/zk/jry1zk.jpg[/image]界中呢？\n\
大家还记得可爱的Milgram老师吗？\n\
[ol]\n\
就是津巴多老师的好机油，以电击实验（好吧，是权威服从实验）闻名于江湖的。\n\
他还做过好多奇形怪状充满想象力的实验。\n\
比如把写好自己地址的明信片/信仍在大街上，等着看自己能回收多少封。。。。\n\
[/ol]\n\
\n\
\n\
\n\
这真不是蛋疼，这个实验还是得出了不少有用的结论的。比如贴上邮票的回收率更高，离邮筒近的回收率更高。这说明好人做好事也需要条件，如果太不方便，就懒得做了。看似蛋疼地验证了一个常识，但是严谨地告诉我们一个道理：要想让世界上有更多好人好事，就要为好人好事创造条件。');
            re = toUbb('aaa<br/><b>bbb</b>');
            expect(re).toEqual('aaa\n[bold]bbb[/bold]');
            re = toUbb('aaa<br/><span></span>');
            expect(re).toEqual('aaa');
            re = toUbb('aaa<br/><span>bbb</span>');
            expect(re).toEqual('aaa\nbbb');
            re = toUbb('<span>aaa<br/>bbb</span>');
            expect(re).toEqual('aaa\nbbb');
            re = toUbb('aaa<br/><div>bbb</div>');
            expect(re).toEqual('aaa\nbbb');
            re = toUbb('aaa<div>bbb</div>');
            expect(re).toEqual('aaa\nbbb');
            re = toUbb('<a href="http://www.guokr.com/i/0014169607/">aaa</a><br><a href="http://www.guokr.com/i/0014169607/">bbb</a>');
            expect(re).toEqual('[url href=http://www.guokr.com/i/0014169607/]aaa[/url]\n[url href=http://www.guokr.com/i/0014169607/]bbb[/url]');
            re = toUbb('<a href="http://www.guokr.com/i/0014169607/">aaa</a><p>bbb</p>');
            expect(re).toEqual('[url href=http://www.guokr.com/i/0014169607/]aaa[/url]\nbbb');
            re = toUbb('aaa<br><blockquote>bbb</blockquote>');
            expect(re).toEqual('aaa\n[blockquote]bbb[/blockquote]');

        });
    });

    it('HTMLtoUBB: keepWhiteSpace and keepNewLine', function() {
        runs(function() {
            var $html = $('#html'),
                ubb = new UBB({
                    defaultColor: '#333333',
                    linkDefaultColor: '#006688',
                    flashImage: 'test.jpg'
                });
            function toUbb(html) {
                $html.html(html);
                // don't use innerHTML
                return ubb.HTMLtoUBB($html[0]);
            }
            // keepNewLine
            // KeepWhiteSpace
            $html.css('whiteSpace', 'pre');

            var isIE678 = jQuery.browser.msie && (parseInt(jQuery.browser.version, 10) <= 8),
                re = toUbb('<p>   aaaa   </p>');
            if (isIE678) {
                expect(re).toEqual('aaaa ');
            } else {
                expect(re).toEqual('   aaaa   ');
            }
            re = toUbb('<p>&nbsp;aaaa&nbsp;</p>');
            expect(re).toEqual('\u00A0aaaa\u00A0');
            re = toUbb('<p>&nbsp;aa   &nbsp;   aa&nbsp;</p>');
            if (isIE678) {
                expect(re).toEqual('\u00A0aa \u00A0 aa\u00A0');
            } else {
                expect(re).toEqual('\u00A0aa   \u00A0   aa\u00A0');
            }

            re = toUbb('\naaa\nbbb\n\n');
            expect(re).toEqual('\naaa\nbbb\n');
            re = toUbb('\naaa\n\nbbb\n\n');
            expect(re).toEqual('\naaa\n\nbbb\n');
            re = toUbb('\n<p>aaa\nbbb</p>\n');
            if (isIE678) {
                expect(re).toEqual('\naaa bbb');
            } else {
                expect(re).toEqual('\naaa\nbbb\n');
            }
            re = toUbb('\n<p>aaa\nbbb\n</p>\n');
            if (isIE678) {
                expect(re).toEqual('\naaa bbb ');
            } else {
                expect(re).toEqual('\naaa\nbbb\n');
            }
            re = toUbb('\n   <p>aaa\nbbb\n</p>\n');
            if (isIE678) {
                expect(re).toEqual('\n   \naaa bbb ');
            } else {
                expect(re).toEqual('\n   \naaa\nbbb\n');
            }
            re = toUbb('\naaa\n<p>bbb</p>\n');
            if (isIE678) {
                expect(re).toEqual('\naaa \nbbb');
            } else {
                expect(re).toEqual('\naaa\nbbb\n');
            }
            re = toUbb('<pre>\naaa\n<p>bbb</p>\n</pre>');
            if (!isIE678) {
                expect(re).toEqual('aaa\nbbb\n');
            }
            re = toUbb('\n<pre>\naaa\n<p>bbb</p>\n</pre>\n');
            if (!isIE678) {
                expect(re).toEqual('\naaa\nbbb\n\n');
            }

            re = toUbb('aaa<p>\n</p>bbb');
            if (!isIE678) {
                expect(re).toEqual('aaa\n\nbbb');
            }
            re = toUbb('aaa<p><br/></p>bbb');
            expect(re).toEqual('aaa\n\nbbb');
            re = toUbb('aaa<pre>\n</pre>bbb');
            if (!isIE678) {
                expect(re).toEqual('aaa\nbbb');
            }
            re = toUbb('\n<br/>\n<br/>\n');
            if (isIE678) {
                expect(re).toEqual('\n\n');
            } else {
                expect(re).toEqual('\n\n\n\n');
            }

            re = toUbb('<p>aaa</p>\nbbb\n');
            if (isIE678) {
                expect(re).toEqual('aaa\nbbb ');
            } else {
                expect(re).toEqual('aaa\n\nbbb');
            }
            re = toUbb('<p>aaa</p>bbb\n');
            if (isIE678) {
                expect(re).toEqual('aaa\nbbb ');
            } else {
                expect(re).toEqual('aaa\nbbb');
            }
            re = toUbb('<br/>bbb\n');
            if (isIE678) {
                expect(re).toEqual('\nbbb ');
            } else {
                expect(re).toEqual('\nbbb');
            }
            re = toUbb('\n<br/>bbb\n');
            if (isIE678) {
                expect(re).toEqual('\n\nbbb ');
            } else {
                expect(re).toEqual('\n\nbbb');
            }

            // not keepNewLine
            // not KeepWhiteSpace
            $html.css('whiteSpace', 'normal');

            re = toUbb('<p>   aaaa   </p>');
            expect(re).toEqual('aaaa');
            re = toUbb('<p>&nbsp;aaaa&nbsp;</p>');
            expect(re).toEqual('\u00A0aaaa\u00A0');
            re = toUbb('<p>&nbsp;aa   &nbsp;   aa&nbsp;</p>');
            expect(re).toEqual('\u00A0aa \u00A0 aa\u00A0');

            re = toUbb('\naaa\nbbb\n\n');
            expect(re).toEqual('aaa bbb');
            re = toUbb('\n<p>aaa\nbbb</p>\n');
            expect(re).toEqual('aaa bbb');
            re = toUbb('\n<p>aaa\nbbb\n</p>\n');
            expect(re).toEqual('aaa bbb');
            re = toUbb('\n   <p>aaa\nbbb\n</p>\n');
            expect(re).toEqual('aaa bbb');
        });
    });

    it('UBBToHTML: new line', function() {
        runs(function() {
            var $html = $('#html'),
                ubb = new UBB({
                    defaultColor: '#333333',
                    linkDefaultColor: '#006688',
                    flashImage: 'test.jpg'
                });
            function toUbb(html) {
                $html.html(html);
                return ubb.HTMLtoUBB($html[0]);
            }
            function toHtml(text) {
                return ubb.UBBtoHTML(text);
            }
            var re = toHtml('Test new line!\nSecond Line.\nLast line.');
            expect(re).toEqual('Test&nbsp;new&nbsp;line!<br/>Second&nbsp;Line.<br/>Last&nbsp;line.');
            re = toUbb('<div><div><div>First Line.</div></div><div><div>Second Line.</div></div><div>Third Line.</div></div>');
            expect(re).toEqual('First Line.\nSecond Line.\nThird Line.');
            re = toHtml('[ref]http://www.guokr.com/post/263028/[/ref]\nNext line.');
            expect(re).toEqual('<div class="gui-ubb-ref">http://www.guokr.com/post/263028/</div>Next&nbsp;line.');
        });
    });

    it('UBBtoHTML: autofix ubb', function() {
        runs(function() {
            var ubb = new UBB({
                    defaultColor: '#333333',
                    linkDefaultColor: '#006688',
                    flashImage: 'test.jpg'
                });
            var re = ubb.fixUBB('[blockquote][bold][italic]Test new line!\nSecond Line.\nLast line.');
            expect(re).toEqual('[blockquote][bold][italic]Test new line![/italic][/bold]\n\
[bold][italic]Second Line.[/italic][/bold]\n\
[bold][italic]Last line.[/italic][/bold][/blockquote]');
            re = ubb.fixUBB('[bold][italic]aaaa[/bold]bbb[/italic]');
            expect(re).toEqual('[bold][italic]aaaa[/italic][/bold][italic]bbb[/italic]');
            re = ubb.fixUBB('[bold]aaaa[/bold][italic]ccc[/italic]bbb[/bold]');
            expect(re).toEqual('[bold]aaaa[/bold][italic]ccc[/italic]bbb');
            re = ubb.fixUBB('[bold][italic]aaaa[/bold]bbb');
            expect(re).toEqual('[bold][italic]aaaa[/italic][/bold][italic]bbb[/italic]');
            re = ubb.fixUBB('[bold][ul]\n\
aaa\n\
bbbb\n\
[/ul]ccc[/bold]');
            expect(re).toEqual('[bold][/bold][ul][bold][/bold]\n\
[bold]aaa[/bold]\n\
[bold]bbbb[/bold]\n\
[bold][/bold][/ul][bold]ccc[/bold]');
            re = ubb.fixUBB('[bold][italic][ul]\n\
aaa\n\
bbbb\n\
[/ul]ccc[/italic][/bold]');
            expect(re).toEqual('[bold][italic][/italic][/bold][ul][bold][italic][/italic][/bold]\n\
[bold][italic]aaa[/italic][/bold]\n\
[bold][italic]bbbb[/italic][/bold]\n\
[bold][italic][/italic][/bold][/ul][bold][italic]ccc[/italic][/bold]');
            re = ubb.fixUBB('[bold]bbb[ref]aaa[/ref]ccc[/bold]');
            expect(re).toEqual('[bold]bbb[/bold][ref]aaa[/ref]ccc');
            re = ubb.fixUBB('[bold][italic]bbb[ref]aaa[/ref]ccc[/italic][/bold]');
            expect(re).toEqual('[bold][italic]bbb[/italic][/bold][ref]aaa[/ref]ccc');
        });
    });

    it('UBBtoHTML: escape', function() {
        runs(function() {
            var ubb = new UBB({
                    defaultColor: '#333333',
                    linkDefaultColor: '#006688',
                    flashImage: 'test.jpg'
                });
            var re = ubb.fixUBB('[bold]before[fake tag]after[/bold]');
            expect(re).toEqual('[bold]before\\[fake tag\\]after[/bold]');
            re = ubb.fixUBB('[bold]before[fake\ntag]after[/bold]');
            expect(re).toEqual('[bold]before\\[fake[/bold]\n[bold]tag\\]after[/bold]');
            re = ubb.UBBtoHTML('\\[bold\\]no bold\\[/bold\\]');
            expect(re).toEqual('[bold]no&nbsp;bold[/bold]');
        });
    });
});

// report
var jasmineEnv = jasmine.getEnv();
jasmineEnv.updateInterval = 1000;
var htmlReporter = new jasmine.HtmlReporter();
jasmineEnv.addReporter(htmlReporter);
jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
};
var currentWindowOnload = window.onload;
window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    execJasmine();
};
function execJasmine() {
    jasmineEnv.execute();
}
