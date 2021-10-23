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

const VersionApi = kc.makeApiClient(k8s.VersionApi);
const CoreV1Api = kc.makeApiClient(k8s.CoreV1Api);
const AppsV1Api = kc.makeApiClient(k8s.AppsV1Api);
let kubeVersion = {};

let chart_namespace = require('./chart/namespace');
let chart_deploymentMaster = require('./chart/deploymentMaster');
let chart_deploymentWorker = require('./chart/deploymentWorker');
let chart_service = require('./chart/service');
let chart_configmapLocustfile = require('./chart/configmapLocustfile');
let chart_configmapConfig = require('./chart/configmapConfig');
let chart_configmapLib = require('./chart/configmapLib');
let chart_ingressMaster = require('./chart/ingressMaster');

async function getKubeVersion() {
    let versionInfo = await VersionApi.getCode()
    kubeVersion = versionInfo.body;
    return kubeVersion;
}


function getIngressAPI() {
    let IngressAPI
    if (kubeVersion.minor >= 21) {
        // since version 1.21
        IngressAPI = kc.makeApiClient(k8s.ExtensionsV1beta1Api);
        IngressAPI.apiVersion = "extensions/v1beta1";
    } else if (kubeVersion.minor >= 19 && kubeVersion.minor < 21) {
        // in version 1.19 and 1.20
        IngressAPI = kc.makeApiClient(k8s.NetworkingV1Api);
        IngressAPI.apiVersion = "networking.k8s.io/v1";
    } else {
        // since version 1.1 to 1.18
        IngressAPI = kc.makeApiClient(k8s.NetworkingV1beta1Api);
        IngressAPI.apiVersion = "networking.k8s.io/v1beta1";
    }
    return IngressAPI;
}

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

        let IngressAPI = getIngressAPI();
        returnvalues.ingresses = await IngressAPI.listNamespacedIngress(namespace=ns_name,
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

async function start(instance){
    console.log(instance);
    returnvalues = {};

    // create a new master deployment
    try {
        chart_deploymentMaster.metadata.name = instance.name + "-master";
        chart_deploymentMaster.metadata.annotations.autodelete = instance.autodelete.toString();
        chart_deploymentMaster.metadata.labels.instance = instance.name;
        chart_deploymentMaster.spec.selector.matchLabels.instance = instance.name;
        chart_deploymentMaster.spec.template.metadata.labels.instance = instance.name;

        chart_deploymentMaster.spec.template.spec.containers[0].image = process.env.LOCUST_IMAGE || "locustio/locust:2.1.0";
        chart_deploymentMaster.spec.template.spec.containers[0].env[0].value = instance.testHost || "https://www.google.com"; // LOCUST_HOST
        chart_deploymentMaster.spec.template.spec.containers[0].env[1].value = instance.numUsers || "1"; // LOCUST_NUM_USERS
        chart_deploymentMaster.spec.template.spec.containers[0].env[2].value = instance.spawnRate || "1"; // LOCUST_SPAWN_RATE
        if (instance.run_time != undefined && instance.run_time != "") { 
            chart_deploymentMaster.spec.template.spec.containers[0].env.push({name: "LOCUST_RUN_TIME", value: instance.run_time });
        }
        if (instance.autostart) {
            chart_deploymentMaster.spec.template.spec.containers[0].env.push({name: "LOCUST_AUTOSTART", value: "true"});
        }
        chart_deploymentMaster.spec.template.spec.volumes[0].configMap.name = instance.locustfile;
        const deploymentMaster = await AppsV1Api.createNamespacedDeployment(namespace=instance.namespace, body=chart_deploymentMaster);
        debug(deploymentMaster);
        returnvalues.deploymentMaster = deploymentMaster;
    } catch (e) {
        console.log(e);
        debug(e);
    }

    // create a new worker deployment
    try {
        chart_deploymentWorker.metadata.name = instance.name + "-worker";
        chart_deploymentWorker.metadata.labels.instance = instance.name;
        chart_deploymentWorker.spec.selector.matchLabels.instance = instance.name;
        chart_deploymentWorker.spec.template.metadata.labels.instance = instance.name;

        chart_deploymentWorker.spec.template.spec.containers[0].image = process.env.LOCUST_IMAGE || "locustio/locust:2.1.0";
        chart_deploymentWorker.spec.template.spec.containers[0].env[0].value = instance.testHost || "https://www.google.com"; // LOCUST_HOST
        chart_deploymentWorker.spec.template.spec.containers[0].env[1].value = instance.numUsers || "1"; // LOCUST_NUM_USERS
        chart_deploymentWorker.spec.template.spec.containers[0].env[2].value = instance.spawnRate || "1"; // LOCUST_SPAWN_RATE
        chart_deploymentWorker.spec.template.spec.containers[0].env[3].value = instance.name; // LOCUST_MASTER_NODE_HOST
        chart_deploymentWorker.spec.replicas = parseInt(instance.workers);
        chart_deploymentWorker.spec.template.spec.volumes[0].configMap.name = instance.locustfile;
        const deploymentWorker = await AppsV1Api.createNamespacedDeployment(namespace=instance.namespace, body=chart_deploymentWorker);
        debug(deploymentWorker);
        returnvalues.deploymentWorker = deploymentWorker;
    } catch (e) {
        console.log(e);
        debug(e);
    }

    // create a new service
    try {
        chart_service.metadata.name = instance.name;
        chart_service.metadata.labels.instance = instance.name;
        chart_service.spec.selector.instance = instance.name;
        const service = await CoreV1Api.createNamespacedService(namespace=instance.namespace, body=chart_service);
        debug(service);
        returnvalues.service = service;
    } catch (e) {
        console.log(e);
        debug(e);
    }

    if (instance.hostname) {
        // create a new ingress
        try {
            let IngressAPI = getIngressAPI();
            chart_ingressMaster.apiVersion = IngressAPI.apiVersion;
            chart_ingressMaster.metadata.name = instance.name + "-ingress";
            chart_ingressMaster.metadata.labels.instance = instance.name;
            chart_ingressMaster.spec.rules[0].host = instance.hostname;
            chart_ingressMaster.spec.rules[0].http.paths[0].backend.service.name = instance.name;
            chart_ingressMaster.spec.rules[0].http.paths[0].backend.serviceName = instance.name;
            //chart_ingressMaster.spec.rules[0].http.paths[0].path = "/";
            //
            //chart_ingressMaster.spec.tls[0].hosts[0] = hostname;
            //chart_ingressMaster.spec.tls[0].secretName = name + "-tls";

            const ingress = await IngressAPI.createNamespacedIngress(namespace=instance.namespace, body=chart_ingressMaster);
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
        let IngressAPI = getIngressAPI();
        returnvalues.ingress = await IngressAPI.deleteNamespacedIngress(name+"-ingress", ns_name);
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

// get a list of library files
async function libraryList(ns_name) {
    returnvalues = {};
    try {
        const ret = await CoreV1Api.readNamespacedConfigMap(
                name="default-lib", 
                namespace=ns_name, 
                pretty=undefined, 
                exact=undefined,
            );
        returnvalues  = ret.response.body.data;
        console.log(returnvalues);
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}

async function libraryUpdate(ns_name, library, content) {
    returnvalues = {};
    try {
        chart_configmapLibrary.metadata.name = library;
        chart_configmapLibrary.data = {"main.py": content};
        returnvalues.locustfiles = await CoreV1Api.replaceNamespacedConfigMap(library, ns_name, chart_configmapLibrary);
    } catch (e) {
        console.log(e);
        debug(e);
    }
    return returnvalues;
}



module.exports = {
    getKubeVersion,
    start,
    stop,
    init,
    list,
    createLocustfile,
    updateLocustfile,
    deleteLocustfile,
    locustfileList,
    libraryList,
    libraryUpdate,
};