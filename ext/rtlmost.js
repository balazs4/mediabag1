// ########## ARGUMENTS

var system = require('system');
var args = system.args;

var timeout = 5000;

var series = [];
series['ejjel-nappal'] = "http://rtl.hu/most/budapest/ejjel-nappal-budapest";
series['showder-klub'] = "http://rtl.hu/most/rtl2/showderklub/showder-klub";

var link = series[args[1]];

var now = new Date();
var month = now.getMonth() + 1;
var day = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();

var date = args[2] || now.getFullYear() + "-" + month + "-" + day;

// ############ PAGE

var url = link + "-" + date;

var page = require('webpage').create();
page.viewportSize = {
    width: 900,
    height: 1600
};
page.onConsoleMessage = function (msg, line, source) {
    //console.log("console>" + msg);
}
page.onResourceRequested = function (req, net) {
    if (req.url.match(/cdn.rtl.hu/)) { //let phantomjs ingore the images...
        net.abort();
    }
    //console.log(req.url);
};
page.onResourceReceived = function (res) {
    //console.log(res.url);
    if (res.stage === 'end') {
        //console.log('Status code: ' + res.status);
        if (res.status == 404)
            phantom.exit();
    }
};

page.open(url, function (status) {
    if (status != "success")
        phantom.exit();

    window.setTimeout(function () {
        page.evaluate(function () {
            console.log("Login...")
            $("div#video-container div.must-login-btns div label:contains('Belépés')").click();
            $("input#loginform-email").val('17kifli@gmail.com');
            $("input#loginform-password").val('*****');
            $("#login-form button.login-button").click();
            console.log("Waiting...");
        });

        window.setTimeout(function () {
            var ep = page.evaluate(function () {
                console.log("Extract...")
                var episode = {
                    "name": $("title").text(),
                    "url": $("video source").attr('src'),
                    "icon": $("video").attr('poster'),
                    "src": $(location).attr('href')
                }
                return episode;
            });

            ep['tags'] = [args[1], "rtlmost"];
            ep['extracted'] = now;

            console.log(JSON.stringify(ep));
            phantom.exit();
        }, timeout);
    }, timeout);

    window.setTimeout(function () {
        phantom.exit();
    }, timeout * 4);
});
