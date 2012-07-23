
/*jshint undef:true, browser:true, noarg:true, curly:true, regexp:true, newcap:true, trailing:false, noempty:true, regexp:false, strict:false, evil:true, funcscope:true, iterator:true, loopfunc:true, multistr:true, boss:true, eqnull:true, eqeqeq:false, undef:false*/

describe('ubb.js:', function() {
    beforeEach(function() {
        jasmine.Clock.useMock();
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
            expect(re).toEqual('<blockquote><br/>This is a blockquote!<br/>And it is awesome!<br/></blockquote>');
            re = ubb.UBBtoHTML('[ul]\nThis is a ul!\nAnd it is awesome!\n[/ul]');
            expect(re).toEqual('<ul><li>This is a ul!</li><li>And it is awesome!</li></ul>');
            re = ubb.UBBtoHTML('[ul]This is a ul!\nAnd it is awesome![/ul]');
            expect(re).toEqual('<ul><li>This is a ul!</li><li>And it is awesome!</li></ul>');
            re = ubb.UBBtoHTML('[ol]\nThis is a ol!\nAnd it is awesome!\n[/ol]');
            expect(re).toEqual('<ol><li>This is a ol!</li><li>And it is awesome!</li></ol>');
            re = ubb.UBBtoHTML('[ol]This is a ol!\nAnd it is awesome![/ol]');
            expect(re).toEqual('<ol><li>This is a ol!</li><li>And it is awesome!</li></ol>');
            re = ubb.UBBtoHTML('[ref]http://www.guokr.com/article/176586/[/ref]\nAfter ref!');
            expect(re).toEqual('<div class="gui-ubb-ref">http://www.guokr.com/article/176586/</div>After ref!');
            re = ubb.UBBtoHTML('[ref]http://www.guokr.com/\narticle/176586/[/ref]\nAfter ref!');
            expect(re).toEqual('<div class="gui-ubb-ref">http://www.guokr.com/</div><div class="gui-ubb-ref">article/176586/</div>After ref!');
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
                return ubb.HTMLtoUBB($html);
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
            expect(re).toEqual('normal words![bold]bold[/bold] [bold]bold[/bold] normal words! [italic]italic[/italic] Test word~ [italic]italic[/italic] normal words! [url href=http://www.guokr.com/]guokr.com[/url]\n\
image:\n\
[image]http://guokr.com/skin/imgs/flash.jpg[/image]\n\
video:\n\
[video]http://player.youku.com/player.php/sid/XNDMwNDEzMjc2/v.swf[/video][ul]\n\
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
        });
    });

    it('UBBtoHTML: new line', function() {
        runs(function() {
            var $html = $('#html'),
                ubb = new UBB({
                    defaultColor: '#333333',
                    linkDefaultColor: '#006688',
                    flashImage: 'test.jpg'
                });
            function toUbb(html) {
                $html.html(html);
                return ubb.HTMLtoUBB($html);
            }
            function toHtml(text) {
                return ubb.UBBtoHTML(text);
            }
            var re = toHtml('Test new line!\nSecond Line.\nLast line.');
            expect(re).toEqual('Test new line!<br/>Second Line.<br/>Last line.');
            re = toUbb('<div><div><div>First Line.</div></div><div><div>Second Line.</div></div><div>Third Line.</div></div>');
            expect(re).toEqual('First Line.\nSecond Line.\nThird Line.');
            re = toHtml('[ref]http://www.guokr.com/post/263028/[/ref]\nNext line.');
            expect(re).toEqual('<div class="gui-ubb-ref">http://www.guokr.com/post/263028/</div>Next line.');
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
            expect(re).toEqual('[bold]no bold[/bold]');
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
