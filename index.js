const cfg = {
    db: 'mediabag',
    col: 'media',
    dir: './db',
    host: '0.0.0.0',
    port: '5555',
    allows: ['GET', 'POST', 'DELETE']
}

const forerunnerdb = require('forerunnerdb');
const fdb = new forerunnerdb();
const db = fdb.db(cfg.db);
db.persist.dataDir(cfg.dir);
db.persist.auto(true);

const app = fdb.api.serverApp();
app.get(`/${cfg.col}`, (req,res) => res.redirect(`/fdb/${cfg.db}/collection/${cfg.col}`))

cfg.allows.forEach(method => fdb.api.access(cfg.db, 'collection', '*', method, 'allow'));
fdb.api.start(cfg.host, cfg.port, { cors: true }, () => console.log('Server is up and running...'));