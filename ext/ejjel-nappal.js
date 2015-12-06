var page = require('webpage').create();


page.onConsoleMessage = function (msg, line, source) {
	//console.log("console>" + msg);
}

page.onResourceRequested = function (req, net) {
	if (req.url.match(/cdn.rtl.hu/)){ //let phantomjs ingore the images...
		net.abort();
	}
};

phantom.onError = function (msg, trace) {
	console.log("error> " + msg);
};

page.open("http://rtl.hu/rtlklub/budapest/videok", function (status) {
	if (status != "success")
		phantom.exit();


	var link = page.evaluate(function () {
		console.log("Getting link...");
		return $(location).attr('origin') + "/" + $("a[href^='/most/budapest/ejjel-nappal-budapest-']").attr('href');
	});

	page.open(link, function (status) {
		if (status != "success")
			phantom.exit();

		page.evaluate(function () {
			console.log("Login...")
			$("#menu-login").click();
			$("input#logindarkform-email").val('varga27@gmail.com');
			$("input#logindarkform-password").val('lofasz');
			$("#login-dark-form button.login-button").click();
			console.log("Waiting...");
		});

		window.setTimeout(function () {
			var ep = page.evaluate(function () {
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
		}, 7000);
	});
});
