const express = require('express');
const router = express.Router();
const debug = require('debug')('superlocust:routes');
const kubectl = require('./kubectl');
const locust = require('./locust');

// the namespace where the locust instance should be deployed
router.get('/config', async function (req, res, next) {
    const swarm = {
        namespace: process.env.NAMESPACE,
    }
    res.send(swarm);
});

// check if API is available
router.get('/ping', async function (req, res, next) {
    res.send("OK");
});

// get list of locust instances 
router.get('/status', async function (req, res, next) {
    res.send(locust.locust);
});

// create a new locustfile in a namespace
router.post('/locustfile/:locustfile', async function (req, res, next) {
    const namespace = req.query.namespace || process.env.NAMESPACE;
    const locustfile = req.params.locustfile;
    const content = req.body.content;

    locust.addLocustfile(namespace, locustfile, content);
    res.send(locust.locust.locustfiles);
});

// create a new locustfile in a namespace
router.delete('/locustfile/:locustfile', async function (req, res, next) {
    const namespace = req.query.namespace || process.env.NAMESPACE;
    const locustfile = req.params.locustfile;
    locust.removeLocustfile(namespace, locustfile);
    res.send(locust.locust.locustfiles);
});

// get the locustfile in a namespace
router.get('/locustfile', async function (req, res, next) {

    const namespace = req.query.namespace || process.env.NAMESPACE;
    console.log("get configs : "+namespace);
    const result = await kubectl.locustfileList(namespace);

    res.send(result);
});

// initial configuration of a namespace
router.get('/namespace/:namespace/init', async function (req, res, next) {
    const namespace = req.params.namespace || process.env.NAMESPACE;
    const result = await kubectl.init(namespace);

    res.send(result);
});
// get list of locust instances in a namespace
// DEPRECATED
router.get('/instance', async function (req, res, next) {
    const namespace = req.query.namespace || process.env.NAMESPACE;
    const result = await kubectl.list(namespace);

    res.send(result);
});

// Start a new instance of a locust in a namespace
router.post('/instance/:instance/:locustfile', async function (req, res, next) {
    const namespace = req.query.namespace || process.env.NAMESPACE;
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
router.delete('/instance/:instance', async function (req, res, next) {
    const namespace = req.query.namespace || process.env.NAMESPACE;
    const instance = req.params.instance;
    locust.removeLocust(namespace, instance);
    res.send(locust.locust.instances);
});

//start a load test
router.get('/loadtest/:instance', async function (req, res, next) {
    const instance = req.params.instance;
    const userCount = req.query.userCount || locust.locust.instances[instance].numUsers;
    const spawnRate = req.query.spawnRate || 1;
    const host = req.query.host || "https://www.google.com";
    locust.startLoadtest(instance, userCount, spawnRate, host) ;
    res.send("OK");
});

//stop a load test
router.delete('/loadtest/:instance', async function (req, res, next) {
    const instance = req.params.instance;
    locust.stopLoadtest(instance);
    res.send("OK");
});

module.exports = router;