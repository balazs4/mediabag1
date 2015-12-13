//jQuery.getScript('http://piserver:5555/munkaugyek');

var item = {};

item['name'] = jQuery("div.newStreamPlayerContainer.programInfoBox.nowPlayed span[itemprop='name']").text();
item['tags'] = ['munkaugyek', 'mediaklikk'];
item['icon'] = "https://upload.wikimedia.org/wikipedia/hu/f/f6/Munka%C3%BCgyek.jpg";
item['src'] = window.location.href;
item['extracted'] = new Date();

jQuery.get(
	jQuery("#hirado_player_box iframe")
		.contents()
		.find("iframe")
		.attr('src'))
	.then(function (content) {
		var url = content.match(/{ 'file': '((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\.\/\?\:@\-_=&#])*' }/gm)[0]
		.replace("'file': '", "")
		.replace("'", "")
		.replace("{", "")
		.replace("}", "")
		.trim();
		item['url'] = url;
		console.log(item);
		jQuery.post("http://piserver:5555/media", item);
	});
