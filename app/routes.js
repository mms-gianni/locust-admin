const express = require('express');
const router = express.Router();
const debug = require('debug')('superlocust:routes');
const kubectl = require('./kubectl');
const locust = require('./locust');

// the namespace where the locust instance should be deployed
router.get('/status', async function (req, res, next) {
    const swarm = {
        namespace: process.env.NAMESPACE,
    }
    res.send(swarm);
});

// check if API is available
router.get('/ping', async function (req, res, next) {
    res.send("OK");
});

// create a new locustfile in a namespace
router.post('/config/:namespace/:locustfile', async function (req, res, next) {
    const namespace = req.params.namespace;
    const locustfile = req.params.locustfile;
    const content = req.body.content;

    locust.addLocustfile(namespace, locustfile, content);
    res.send(locust.locust.locustfiles);
});

// create a new locustfile in a namespace
router.delete('/config/:namespace/:locustfile', async function (req, res, next) {
    const namespace = req.params.namespace;
    const locustfile = req.params.locustfile;
    locust.removeLocustfile(namespace, locustfile);
    res.send(locust.locust.locustfiles);
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

    locust.addLocust(namespace, instance, locustfile, hostname, workers, testHost, numUsers, spawnRate);
    res.send(locust.locust.instances);
});

// delete a locust instance in a namespace
router.delete('/cluster/:namespace/:instance', async function (req, res, next) {
    const namespace = req.params.namespace;
    const instance = req.params.instance;
    locust.removeLocust(namespace, instance);
    res.send(locust.locust.instances);
});

module.exports = router;