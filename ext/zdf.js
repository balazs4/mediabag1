// ########## ARGUMENTS

var system = require('system');
var args = system.args;

var base = "http://www.zdf.de";

var links = [];
links['heute-journal'] = base + "/ZDFmediathek/hauptnavigation/nachrichten/ganze-sendungen?bc=nrt;nrg&gs=228&flash=off"
links['heute'] = base + "/ZDFmediathek/hauptnavigation/nachrichten/ganze-sendungen?bc=nrt;nrg&gs=166&flash=off";

var url = links[args[1]];

// ######### PAGE
var webpage = require('webpage');
var page = webpage.create();
page.viewportSize = {
    width: 900,
    height: 1600
};

page.open(url, function (status) {
    if (status != "success")
        phantom.exit();

    var subpage = webpage.create();
    var suburl = page.evaluate(function () {
        return $("div.beitragListe b a").attr("href");
    });

    subpage.open(base + suburl, function (substatus) {
        if (substatus != "success")
            phantom.exit();

        var video = subpage.evaluate(function () {
            return {
                "name": $("div#content h1.beitragHeadline").text(),
                "url": $("ul.dslChoice li:contains('DSL 2000') a").attr("href"),
                "icon": $("div#playerContainer div#zdfplayer1_startImage img").attr("src"),
                "src": $(location).attr('href'),
            }
        });

        video['tags'] = ["zdf", "heute"];
        video['extracted'] = new Date();

        console.log(JSON.stringify(video));
        phantom.exit(0);
    });

});
