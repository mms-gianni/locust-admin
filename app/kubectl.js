const k8s = require('@kubernetes/client-node');
const debug = require('debug')('superlocust:kubectl');
const path = require('path');

const kc = new k8s.KubeConfig();

if (process.env.KUBECONFIG_BASE64) {
    console.log("read kubeconfig from KUBECONFIG_BASE64");
    let buff = new Buffer.from(process.env.KUBECONFIG_BASE64, 'base64');
    const kubeconfig = buff.toString('ascii');
    kc.loadFromString(kubeconfig);
} else if(process.env.KUBECONFIG_PATH) { 
    kc.loadFromFile(process.env.KUBECONFIG_PATH);
} else if (process.env.KUBERNETES_SERVICE_TOKEN){
    kc.loadFromOptions({
        token: process.env.KUBERNETES_SERVICE_TOKEN,
        username: process.env.KUBERNETES_USER,
        password: process.env.KUBERNETES_PASSWORD,
        caFile: process.env.KUBERNETES_CA_CERT,
        server: process.env.KUBERNETES_SERVICE_HOST + ':' + process.env.KUBERNETES_SERVICE_PORT
    });
} else{
    kc.loadFromCluster();
}

const CoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
const AppsV1Api = kc.makeApiClient(k8s.AppsV1Api);
const NetworkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);

let chart_namespace = require('./chart/namespace');
let chart_deploymentMaster = require('./chart/deploymentMaster');
let chart_deploymentWorker = require('./chart/deploymentWorker');
let chart_service = require('./chart/service');
let chart_configmapLocustfile = require('./chart/configmapLocustfile');
let chart_configmapConfig = require('./chart/configmapConfig');
let chart_configmapLib = require('./chart/configmapLib');
let chart_ingressMaster = require('./chart/ingressMaster');

// create a namespace
async function init(ns_name) {
    returnvalues = {};
    try {
        chart_namespace.metadata.name = ns_name;
        returnvalues.namespace = await CoreV1Api.createNamespace(body=chart_namespace);
        debug(namespace);
    } catch (e) {
        namespace = await CoreV1Api.readNamespace(ns_name);
    }

    try {
        returnvalues.config = await CoreV1Api.createNamespacedConfigMap(namespace=ns_name, body=chart_configmapConfig);
        debug(returnvalues.locustfile);
        returnvalues.lib = await CoreV1Api.createNamespacedConfigMap(namespace=ns_name, body=chart_configmapLib);
        debug(returnvalues.locustfile);
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}

// list locust master deployments
async function list(ns_name) {
    returnvalues = {};
    try {
        returnvalues.deployments = await AppsV1Api.listNamespacedDeployment(namespace=ns_name)
        returnvalues.services = await CoreV1Api.listNamespacedService(namespace=ns_name,
            pretty=undefined,
            allowWatchBookmarks=undefined,
            _continue=undefined,
            fieldselector=undefined,
            labelSelector="component=master");
        returnvalues.ingresses = await NetworkingV1Api.listNamespacedIngress(namespace=ns_name,
            pretty=undefined,
            allowWatchBookmarks=undefined,
            _continue=undefined,
            fieldselector=undefined,
            labelSelector="component=master");

        returnvalues.locustfiles = await CoreV1Api.listNamespacedConfigMap(namespace=ns_name, 
            pretty=undefined,
            allowWatchBookmarks=undefined,
            _continue=undefined,
            fieldselector=undefined,
            labelSelector="config=locustfile");
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}

//async function start(ns_name, name, locustfile, hostname=undefined, workers=undefined, hatch_rate=undefined, master_port=undefined, worker_port=undefined, master_url=undefined, worker_url=undefined) {
async function start(ns_name, name, locustfile, hostname=undefined, workers=1, testHost=undefined, numUsers="1", spawnRate="1"){
    returnvalues = {};

    // create a new master deployment
    try {
        chart_deploymentMaster.metadata.name = name + "-master";
        chart_deploymentMaster.metadata.labels.instance = name;
        chart_deploymentMaster.spec.selector.matchLabels.instance = name;
        chart_deploymentMaster.spec.template.metadata.labels.instance = name;

        chart_deploymentMaster.spec.template.spec.containers[0].env[0].value = testHost || "https://www.google.com"; // LOCUST_HOST
        chart_deploymentMaster.spec.template.spec.containers[0].env[1].value = numUsers || "1"; // LOCUST_NUM_USERS
        chart_deploymentMaster.spec.template.spec.containers[0].env[2].value = spawnRate || "1"; // LOCUST_SPAWN_RATE
        chart_deploymentMaster.spec.template.spec.volumes[0].configMap.name = locustfile;
        const deploymentMaster = await AppsV1Api.createNamespacedDeployment(namespace=ns_name, body=chart_deploymentMaster);
        debug(deploymentMaster);
        returnvalues.deploymentMaster = deploymentMaster;
    } catch (e) {
        console.log(e);
        debug(e);
    }

    // create a new worker deployment
    try {
        chart_deploymentWorker.metadata.name = name + "-worker";
        chart_deploymentWorker.metadata.labels.instance = name;
        chart_deploymentWorker.spec.selector.matchLabels.instance = name;
        chart_deploymentWorker.spec.template.metadata.labels.instance = name;

        chart_deploymentWorker.spec.template.spec.containers[0].env[0].value = testHost || "https://www.google.com"; // LOCUST_HOST
        chart_deploymentWorker.spec.template.spec.containers[0].env[1].value = numUsers || "1"; // LOCUST_NUM_USERS
        chart_deploymentWorker.spec.template.spec.containers[0].env[2].value = spawnRate || "1"; // LOCUST_SPAWN_RATE
        chart_deploymentWorker.spec.template.spec.containers[0].env[3].value = name; // LOCUST_MASTER_NODE_HOST
        chart_deploymentWorker.spec.replicas = parseInt(workers);
        chart_deploymentWorker.spec.template.spec.volumes[0].configMap.name = locustfile;
        const deploymentWorker = await AppsV1Api.createNamespacedDeployment(namespace=ns_name, body=chart_deploymentWorker);
        debug(deploymentWorker);
        returnvalues.deploymentWorker = deploymentWorker;
    } catch (e) {
        console.log(e);
        debug(e);
    }

    // create a new service
    try {
        chart_service.metadata.name = name;
        chart_service.metadata.labels.instance = name;
        chart_service.spec.selector.instance = name;
        const service = await CoreV1Api.createNamespacedService(namespace=ns_name, body=chart_service);
        debug(service);
        returnvalues.service = service;
    } catch (e) {
        console.log(e);
        debug(e);
    }

    if (hostname != undefined) {
        // create a new ingress
        try {
            chart_ingressMaster.metadata.name = name + "-ingress";
            chart_ingressMaster.metadata.labels.instance = name;
            chart_ingressMaster.spec.rules[0].host = hostname;
            chart_ingressMaster.spec.rules[0].http.paths[0].backend.service.name = name;
            //chart_ingressMaster.spec.rules[0].http.paths[0].path = "/";
            //chart_ingressMaster.spec.rules[0].http.paths[0].backend.servicePort = 80;
            //chart_ingressMaster.spec.tls[0].hosts[0] = hostname;
            //chart_ingressMaster.spec.tls[0].secretName = name + "-tls";

            const ingress = await NetworkingV1Api.createNamespacedIngress(namespace=ns_name, body=chart_ingressMaster);
            debug(ingress);
            returnvalues.ingress = ingress;
        } catch (e) {
            console.log(e);
            debug(e);
        }
    }

    return returnvalues;
}

async function stop(ns_name, name) {
    returnvalues = {};
    try {
        returnvalues.deploymentWorker = await AppsV1Api.deleteNamespacedDeployment(name+"-worker", ns_name);
        returnvalues.deploymentMaster = await AppsV1Api.deleteNamespacedDeployment(name+"-master", ns_name);
        returnvalues.service = await CoreV1Api.deleteNamespacedService(name, ns_name);
        returnvalues.ingress = await NetworkingV1Api.deleteNamespacedIngress(name+"-ingress", ns_name);
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}

// list all Locustfiles
async function locustfileList(ns_name) {
    returnvalues = {};
    try {
        returnvalues.locustfiles = await CoreV1Api.listNamespacedConfigMap(namespace=ns_name, 
            pretty=undefined,
            allowWatchBookmarks=undefined,
            _continue=undefined,
            fieldselector=undefined,
            labelSelector="config=locustfile");
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}

async function createLocustfile(ns_name, locustfile, content) {
    returnvalues = {};
    try {
        chart_configmapLocustfile.metadata.name = locustfile;
        chart_configmapLocustfile.data = {"main.py": content};
        console.log(chart_configmapLocustfile);
        returnvalues.locustfiles = await CoreV1Api.createNamespacedConfigMap(namespace=ns_name, body=chart_configmapLocustfile);
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}

// update a locustfile
async function updateLocustfile(ns_name, locustfile, content) {
    returnvalues = {};
    try {
        chart_configmapLocustfile.metadata.name = locustfile;
        chart_configmapLocustfile.data.locustfile = content;
        returnvalues.locustfiles = await CoreV1Api.replaceNamespacedConfigMap(locustfile, ns_name, chart_configmapLocustfile);
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}

// delete a locustfile
async function deleteLocustfile(ns_name, locustfile) {
    /*
    // check if config is in use anywhere else
    const instances = this.list(ns_name);
    for (const instance of instances.items) {
        if (instance.spec.template.spec.volumes[0].configMap.name == locustfile) {
            await this.stop(ns_name, instance.metadata.name);
        }
    }
    */
    
    returnvalues = {};
    try {
        returnvalues.locustfiles = await CoreV1Api.deleteNamespacedConfigMap(locustfile, ns_name);
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}


module.exports = {start, stop, init, list, createLocustfile, updateLocustfile, deleteLocustfile, locustfileList};