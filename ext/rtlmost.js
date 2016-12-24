const now = '2016-12-15'

require('nightmare')({ show: true  })
    .viewport(1600, 900)
    .goto(`http://rtl.hu/most/budapest/ejjel-nappal-budapest-${now}`)
    .wait("div#video-container")
    .evaluate(() => {
            $("div#video-container div.must-login-btns div label:contains('Belépés')").click();
            $("input#loginform-email").val('17kifli@gmail.com');
            $("input#loginform-password").val('*****');
            $("#login-form button.login-button").click();
        })
    .wait("video")
    .evaluate(() => ({
            "name": $("title").text(),
            "url": $("video source").attr('src'),
            "icon": $("video").attr('poster'),
            "src": $(location).attr('href'),
            "tags": ['ejjel-nappal', 'rtlmost'],
            "extracted": new Date()
        }))
    .end()
    .then(x => console.log(x))
    .catch(x => console.log(x));
