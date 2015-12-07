var system = require('system');
var args = system.args;

var now = new Date();
var month = now.getMonth() + 1;
var day = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();

var date = args[1] || now.getFullYear() + "-" + month + "-" + day;
//console.log(date);


var page = require('webpage').create();


page.onConsoleMessage = function(msg, line, source) {
    //console.log("console>" + msg);
}

page.onResourceRequested = function(req, net) {
    if (req.url.match(/cdn.rtl.hu/)) { //let phantomjs ingore the images...
        net.abort();
    }
};


page.onResourceReceived = function(res) {
    if (res.stage === 'end') {
        //console.log('Status code: ' + res.status);
        if (res.status == 404)
            phantom.exit();
    }
};

phantom.onError = function(msg, trace) {
    //console.log("error> " + msg);
};

page.open("http://rtl.hu/most/budapest/ejjel-nappal-budapest-" + date, function(status) {
    if (status != "success")
        phantom.exit();

    window.setTimeout(function() {
        page.evaluate(function() {
            console.log("Login...")
            $("#menu-login").click();
            $("input#logindarkform-email").val('17kifli@gmail.com');
            $("input#logindarkform-password").val('*****');
            $("#login-dark-form button.login-button").click();
            console.log("Waiting...");
        });

        window.setTimeout(function() {
            var ep = page.evaluate(function() {
                console.log("Extract...")
                var episode = {
                    "name": $("title").text(),
                    "url": $("video source").attr('src'),
                    "icon": $("video").attr('poster'),
                    "tags": ["ejjel-nappal-budapest", "rtlmost"],
                    "src": $(location).attr('href')
                }
                return episode;
            });
            console.log(JSON.stringify(ep));
            phantom.exit();
        }, 10000);
    }, 10000);

    window.setTimeout(function() {
        phantom.exit();
    }, 60000);
});
