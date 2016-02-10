// ########## ARGUMENTS

var system = require('system');
var args = system.args;

var base = "http://www.zdf.de";

var topics = [];
topics['heute-journal'] = {
    url: base + "/ZDFmediathek/hauptnavigation/nachrichten/ganze-sendungen?bc=nrt;nrg&gs=228&flash=off",
    tags: ["zdf", "heute"]
};
topics['heute'] = {
    url: base + "/ZDFmediathek/hauptnavigation/nachrichten/ganze-sendungen?bc=nrt;nrg&gs=166&flash=off",
    tags: ["zdf", "heute"]
};
topics['herzkino'] = {
    url: base + "/ZDFmediathek/kanaluebersicht/aktuellste/1740652?bc=saz;saz2;kua448&flash=off",
    tags: ["zdf", "herzkino"]
};


var topic = topics[args[1]];

// ######### PAGE
var webpage = require('webpage');
var page = webpage.create();
page.viewportSize = {
    width: 900,
    height: 1600
};

page.open(topic.url, function (status) {
    if (status != "success")
        phantom.exit();

    var subpage = webpage.create();
    var suburls = page.evaluate(function () {
        return $("div.beitragListe b a").map(function () {
            return $(this).attr("href");
        });
    });

    subpage.open(base + suburls[0], function (substatus) {
        if (substatus != "success")
            phantom.exit();

        setTimeout(function () {
            var video = subpage.evaluate(function () {
               var original = $($("p.datum")[0]).text();
               var splitted = original.match(/(.*), (\d+).(\d+).(\d+) (\d+:\d+)/);

                return {
                    "name": splitted[4] + "-" + splitted[3] + "-" + splitted[2] + " " + splitted[5] + " " + splitted[1],
                    "url": $("ul.dslChoice li:contains('DSL 2000') a").attr("href"),
                    "icon": $("div#playerContainer div#zdfplayer1 img").attr("src") || "http://ftp.halifax.rwth-aachen.de/xbmc/addons/jarvis/plugin.video.zdf_de_lite/icon.png",
                    "src": $(location).attr('href'),
                }
            });

            video['tags'] = topic.tags;
            video['extracted'] = new Date();

            console.log(JSON.stringify(video));
            phantom.exit(0);
        }, 10000);

    });

});
