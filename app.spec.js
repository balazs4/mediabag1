var chai = require('chai');
chai.use(require('chai-http'));
chai.should();

var path = require('path');

var app = require('./app');
var server = app.get('server');

describe('Features', () => {

	it.skip('POST /watchitlater', (done) => {
		chai.request(server)
			.post("/watchitlater")
			.send({
				"iframe": "http://mediaklikk.hu/player/player-external-vod-full.php?token=U2FsdGVkX1%2F%2BfeQUJPHl6oiD50nZISRTef67T%2Bmg58Ggpe6pLV7DZsafr%2FvRaeEE1A8LnzbaTGq9iwTTVhQHF4nzk5Y03PbSA1auvMDWt49484rCEDlPRA5HjfsXHFY7xsWfLEYJUl8fXodBdWlZVm7Zg57T3MTIxg%2B0QVU7OZc%3D&height=520&width=960"
			})
			.then(res => {
				res.status.should.be.equal(201);

				res.body.should.eql({
					"file": "http://212.40.98.162/intvod/_definst_/r/mtva/2015/11/16/2015-004548-M0009-01-/international.smil/playlist.m3u8?keys=2YLKtyhjV6NBZtyoshGX4g&keyt=1448740659"
				});

				done();
			}, (err) => done(err))
			.catch(err => done(err));
	});


	it('GET /channels', (done) => {
		chai.request(server)
			.get('/channels')
			.then(res => {
				res.status.should.be.equal(200);
				var expected = require('./channels.json');
				res.body.should.eql(expected);
				done();
			})
			.catch(err => done(err));
	})
})