const log = require('debug')('mediaklikk');
const phantom = require('phantom');

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

  log('Extracting content');
  const content = await page.property('content');

  const [rawLink] = content.match(/(http:.*\.m3u8\?v=5)/g);
  const link = rawLink.replace(/\\\//g, '/');
  log(`Found link ${link}`);

  log('Closing phantom instance');
  await instance.exit();
  return link;
};

const channels = {
  mtv1live: {
    name: 'M1',
    icon: 'http://www.mediaklikk.hu/wp-content/uploads/sites/4/2013/11/M1.png'
  },
  mtv2live: {
    name: 'M2',
    icon: 'http://www.mediaklikk.hu/wp-content/uploads/sites/4/2013/11/M2.png'
  },
  mtv4live: {
    name: 'M4 Sport',
    icon: 'http://mediaklikk.cms.mtv.hu/wp-content/uploads/sites/4/2015/06/M4_logo.png'
  },
  dunalive: {
    name: 'Duna',
    icon: 'http://www.mediaklikk.hu/wp-content/uploads/sites/4/2013/11/Duna.png'
  }
};

module.exports = async streamId => {
  log(`Looking for '${streamId}'`);
  const src = `http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=${streamId}&noflash=yes`;
  const url = await getLink(src);
  const { name = streamId, icon = '' } = channels[streamId];
  const result = {
    name,
    src,
    url,
    tags: ['live'],
    when: new Date()
  };
  log(`Result ${JSON.stringify(result)}`);
  return result;
};
