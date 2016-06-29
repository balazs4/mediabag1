(function extractAll(list) {
    var extract = function(episode) {
        var url = 'http://' + location.hostname + '/wp-content/plugins/hms-teleteka-widgets/interfaces/getStreamId.php';
        var video = episode.post.id;
        var type = 'vod';
        var tekaId = episode.meta.teka[0];
        var price = episode.post.price;


        jQuery.ajax({
                method: "POST",
                url: url,
                data: { video: video, type: type, teka: tekaId, price: price }
            })
            .done(function(msg) {

                if (msg < 0) {
                    console.error(episode);
                    return;
                }
                var link = Helper.fixUpString(msg);

                var item = {};
                item['name'] = episode.post.title.replace(/\d+\s?.\s?rész/gmi, function(a, b) {

                	if (/98.rész/.test(a)){
                		//korhatar...lol :)
                		return "0" + a;
                	}

                    switch (a.length) {
                        case 7:
                            return "00" + a;
                        case 8:
                            return "0" + a;
                        default:
                            return a;
                    };
                });
                item['tags'] = ['munkaugyek', 'teleteka'];
                item['icon'] = "https://upload.wikimedia.org/wikipedia/hu/f/f6/Munka%C3%BCgyek.jpg";
                item['src'] = window.location.href;
                item['extracted'] = new Date();
                item['url'] = link;

                console.log(item);
                jQuery.post("http://piserver:5555/media", item);
            });
    }

    list.forEach(function(item){
    	extract(item);
    });
})(Series.json);
