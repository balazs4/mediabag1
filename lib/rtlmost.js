const log = require('debug')('rtlmost');
const phantom = require('phantom');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const waitFor = (selector, page) =>
  new Promise(async (resolve, reject) => {
    const timeout = process.env.TIMEOUT || 5000;
    let loop = true;
    const timer = setTimeout(() => {
      loop = false;
      reject(`'${selector}' did not exist after ${timeout} ms`);
    }, timeout);

    while (loop) {
      const exist = await page.evaluate(function(s) {
        return document.querySelector(s) !== null;
      }, selector);
      if (exist) {
        loop = false;
        clearTimeout(timer);
        resolve();
      }
      log(`'${selector}' does not exist, waiting...`);
      await delay(500);
    }
  });

const getLink = async src => {
  log('Creating phantom instance');
  const instance = await phantom.create([
    '--ignore-ssl-errors=yes',
    '--load-images=no'
  ]);

  log('Creating page object');
  const page = await instance.createPage();

  log(`Opening ${src}`);
  await page.open(src);

  await waitFor('div#video-container', page);
  log('Login');
  await page.evaluate(function() {
    $(
      "div#video-container div.must-login-btns div label:contains('Belépés')"
    ).click();
    $('input#loginform-email').val('17kifli@gmail.com');
    $('input#loginform-password').val('*****');
    $('#login-form button.login-button').click();
  });

  log('Wating for <video> element');
  await waitFor('video', page);

  log('Extracting content');
  const media = await page.evaluate(function() {
    return {
      name: $('title').text(),
      url: $('video source').attr('src'),
      icon: $('video').attr('poster')
    };
  });

  log('Closing phantom instance');
  await instance.exit();
  return media;
};

const sources = {
  'ejjel-nappal': day =>
    `http://rtl.hu/most/budapest/ejjel-nappal-budapest-${day}`,
  'a-mi-kis-falunk': day =>
    `http://rtl.hu/most/mikisfalunk/a-mi-kis-falunk-${day}`
};

module.exports = async (id, day) => {
  log(`Looking for ${id}, ${day}`);
  const src = sources[id](day);
  const item = await getLink(src);
  const result = Object.assign({}, item, { src, tags: [id] });
  log(`Result ${JSON.stringify(result)}`);
  return result;
};
