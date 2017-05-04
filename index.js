const phantom = require('phantom');

const getLink = async streamId => {
  const instance = await phantom.create();
  const page = await instance.createPage();
  await page.open(
    `http://player.mediaklikk.hu/player/player-inside-full3.php?userid=mtva&streamid=${streamId}&noflash=yes`
  );
  const content = await page.property('content');
  await instance.exit();
  const [rawLink] = content.match(/(http:.*\.m3u8\?v=5)/g);
  const link = rawLink.replace(/\\\//g, '/');
  return {
    [streamId]: link
  };
};

const getLinks = async iter => {
  const results = await Promise.all(iter.map(getLink));
  return results.reduce((acc, cur) => {
    const [key] = Object.keys(cur);
    acc[key] = cur[key];
    return acc;
  });
};

getLinks(['mtv1live', 'mtv2live', 'mtv4live', 'dunalive']).then(console.log);
