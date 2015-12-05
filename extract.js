var page = require('webpage').create();


page.onConsoleMessage = function (msg, line, source) {
	console.log("console>" + msg);
}


page.open("http://rtl.hu/most/budapest/ejjel-nappal-budapest-2015-12-02", function (status) {

	if (status === "success") {
		page.evaluate(function () {
			$("#menu-login").click();
			$("input#logindarkform-email").val('varga27@gmail.com');
			$("input#logindarkform-password").val('lofasz');
			$("#login-dark-form button.login-button").click();
		});

		window.setTimeout(function () {
			page.evaluate(function () {
				var episode = {
					"name": $("title").text(),
					"url": $("video source").attr('src'),
					"icon": $("video").attr('poster'),
					"tags": ["ejjel-nappal-budapest", "rtlmost"],
					"src" : $(location).attr('href')
				}

				console.log(JSON.stringify(episode));
			});
			phantom.exit();
		}, 5000);
	}
});