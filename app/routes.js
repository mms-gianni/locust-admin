const express = require('express');
const router = express.Router();
const debug = require('debug')('superlocust:routes');
const kubectl = require('./kubectl');
const locust = require('./locust');

// check if API is available
router.get('/status', async function (req, res, next) {
    res.send("OK");
});

// create a new locustfile in a namespace
router.post('/config/:namespace/:locustfile', async function (req, res, next) {
    const namespace = req.params.namespace;
    const locustfile = req.params.locustfile;
    const content = req.body.content;
    const result = await kubectl.createLocustfile(namespace, locustfile, content);

    res.send(result);
});

// create a new locustfile in a namespace
router.delete('/config/:namespace/:locustfile', async function (req, res, next) {
    const namespace = req.params.namespace;
    const locustfile = req.params.locustfile;
    const result = await kubectl.deleteLocustfile(namespace, locustfile);

    res.send(result);
});

// get the configs in a namespace
router.get('/config/:namespace', async function (req, res, next) {

    const namespace = req.params.namespace;
    console.log("get configs : "+namespace);
    const result = await kubectl.locustfileList(namespace);

    res.send(result);
});

// initial configuration of a namespace
router.get('/cluster/init/:namespace', async function (req, res, next) {
    const namespace = req.params.namespace;
    const result = await kubectl.init(namespace);

    res.send(result);
});

// get list of locust instances 
router.get('/cluster', async function (req, res, next) {
    res.send(locust.locust);
});

// get list of locust instances in a namespace
// DEPRECATED
router.get('/cluster/:namespace', async function (req, res, next) {
    const namespace = req.params.namespace;
    const result = await kubectl.list(namespace);

    res.send(result);
});

// Start a new instance of a locust in a namespace
router.post('/cluster/:namespace/:instance/:locustfile', async function (req, res, next) {
    const namespace = req.params.namespace;
    const instance = req.params.instance;
    const locustfile = req.params.locustfile;
    const hostname = req.body.hostname;
    const workers = req.body.workers || 1;
    const testHost = req.body.testHost || "https://www.google.com"
    const numUsers = req.body.numUsers || "1";
    const spawnRate = req.body.spawnRate || "1";
    const result = await kubectl.start(namespace, instance, locustfile, hostname, workers, testHost, numUsers, spawnRate);

    res.send(result);
});

// delete a locust instance in a namespace
router.delete('/cluster/:namespace/:instance', async function (req, res, next) {
    const namespace = req.params.namespace;
    const instance = req.params.instance;
    const result = await kubectl.stop(namespace, instance);

    res.send(result);
});

module.exports = router;