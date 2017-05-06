const phantom = require('phantom');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const waitForVideo = (page, timeout) =>
  new Promise(async (resolve, reject) => {
    const timer = setTimeout(reject, timeout);

    while (true) {
      const exist = await page.evaluate(function() {
        return document.querySelector('video') !== null;
      });
      if (exist) {
        clearTimeout(timer);
        resolve();
      }
      console.log('waiting for video...');
      await delay(500);
    }
  });

(async url => {
  const instance = await phantom.create([
    '--ignore-ssl-errors=yes',
    '--load-images=no'
  ]);
  const page = await instance.createPage();

  await page.open(url);
  await page.evaluate(function() {
    $(
      "div#video-container div.must-login-btns div label:contains('Belépés')"
    ).click();
    $('input#loginform-email').val('17kifli@gmail.com');
    $('input#loginform-password').val('*****');
    $('#login-form button.login-button').click();
  });
  await waitForVideo(page, 5000);
  const media = await page.evaluate(function() {
    return {
      name: $('title').text(),
      url: $('video source').attr('src'),
      icon: $('video').attr('poster'),
      src: $(location).attr('href')
    };
  });
  await instance.exit();
  console.log(media);
})('http://rtl.hu/most/budapest/ejjel-nappal-budapest-2017-05-05');
