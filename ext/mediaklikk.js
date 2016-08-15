// ########## ARGUMENTS

var system = require('system');
var args = system.args;

var timeout = system.env['MEDIABAG'] || 35000;

var streams = [];
streams['m1'] = "http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=mtv1live&noflash=yes&hls=1";
streams['m2'] = "http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=mtv2live&noflash=yes&hls=1";
streams['m4'] = "http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=mtv4live&noflash=yes&hls=1";;
streams['Duna'] = "http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=dunalive&noflash=yes&hls=1";

var link = streams[args[1]];

var webpage = require('webpage');
var page = webpage.create();

page.settings.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';
page.zoomFactor = 1;
page.viewportSize = {
    width: 320,
    height: 568
};


page.open(link, function (status) {
    if (status != "success")
        phantom.exit();


    page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function () {
        var url = page.evaluate(function () {
            return jQuery('#videoId').children("source").attr('src');
        })
        console.log(url);
        phantom.exit();
    })
});