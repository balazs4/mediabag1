const {readdirSync} = require('fs');
const {basename} = require('path');

module.exports = db => {
    const api = require('express').Router();
    readdirSync(__dirname)
        .filter(x => x !== basename(__filename))
        .map(x => basename(x, '.js'))
        .forEach(route => api.use(`/${route}`, require(`./${route}`)(db)))
    return api;
}