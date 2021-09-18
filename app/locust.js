const debug = require('debug')('superlocust:locust');
const kubectl = require('./kubectl');
const socket = require('./socket');
const axios = require('axios');

let locust = {
    instances: {},
    locustfiles: {},
};

async function startLoadtest(instanceName) {

    
    //axios.get(`http://${locust.instances[instanceName].name}:8089/stats/requests`).then(function(response) {
    axios.get(`http://${locust.instances[instanceName].name}:8089/stats/requests`).then(function(response) {
        //console.log(response.data);
    }).catch(function(error) {
        //console.log(error);
        console.log("load data error");
    });
    return
}

async function stopLoadtest(instanceName) {

    return
}

// initial loading of all instances
async function init() {
    try {
        debug('loading');
        const namespace = process.env.NAMESPACE || 'default';
        const result = await kubectl.list(namespace);
        result.services.response.body.items.forEach(element => {
            locust.instances[element.metadata.name] = {
                name: element.metadata.name,
                namespace: element.metadata.namespace,
                creationTimestamp: element.metadata.creationTimestamp,
                status: {
                    'master': {
                        'replicas': 0,
                        'unavailableReplicas': 0,
                        'readyReplicas': 0,
                    },
                    'worker': {
                        'replicas': 0,
                        'unavailableReplicas': 0,
                        'readyReplicas': 0,
                    },
                }
            };
        });

        result.ingresses.response.body.items.forEach(element => {
            locust.instances[element.metadata.name.replace("-ingress", "")]['ingressHost'] = element.spec.rules[0].host;
        });
        result.deployments.response.body.items.forEach(element => {
            if (element.metadata.name.endsWith("-worker")) {
                let workerName = element.metadata.name.replace("-worker", "")
                locust.instances[workerName]['worker'] = element.spec.replicas;
                locust.instances[workerName].status.worker.replicas = element.status.replicas;
                locust.instances[workerName].status.worker.unavailableReplicas = element.status.unavailableReplicas || 0;
                locust.instances[workerName].status.worker.readyReplicas = element.status.readyReplicas || 0;
            }
            if (element.metadata.name.endsWith("-master")) {
                let masterinstance = element.metadata.name.replace("-master", "")
                locust.instances[masterinstance]['testHost'] = element.spec.template.spec.containers[0].env[0].value;
                locust.instances[masterinstance]['numUsers'] = element.spec.template.spec.containers[0].env[1].value;
                locust.instances[masterinstance]['spawnRate'] = element.spec.template.spec.containers[0].env[2].value;
                locust.instances[masterinstance]['locustfile'] = element.spec.template.spec.volumes[0].configMap.name;
                locust.instances[masterinstance].status.master.replicas = element.status.replicas;
                locust.instances[masterinstance].status.master.unavailableReplicas = element.status.unavailableReplicas || 0;
                locust.instances[masterinstance].status.master.readyReplicas = element.status.readyReplicas || 0;
            }
        });

        result.locustfiles.response.body.items.forEach(element => {
            locust.locustfiles[element.metadata.name] = {
                name: element.metadata.name,
                namespace: element.metadata.namespace,
                creationTimestamp: element.metadata.creationTimestamp,
            };
        });
        console.log(locust);
        debug('loaded');
    } catch (error) {
        console.log(error);
        console.log("ERROR: Cant connect to Kubernetes Cluster");
    }
}

async function addLocustfile(namespace, name, locustfile) {
    const result = await kubectl.createLocustfile(namespace, name, locustfile);
    console.log(result.locustfiles.response.statusCode);
    setTimeout(() => {
        if (result.locustfiles.response.statusCode == 200) {
            locust.locustfiles[name] = {
                name: name,
                namespace: namespace,
                creationTimestamp: result.locustfiles.response.body.metadata.creationTimestamp
            };
            socket.updatedLocustfiles(locust.locustfiles)
            console.log(locust);
        }
    }, 1000);
    debug('added');
}

async function removeLocustfile(namespace, locustfile) {
    const result = await kubectl.deleteLocustfile(namespace, locustfile);
    if (result.locustfile.response.statusCode == 200) {
        delete locust.locustfiles[locustfile];
        socket.updatedLocustfiles(locust.locustfiles)
        console.log(locust);
    }
    debug('removed');
}

async function addLocust(namespace, instance, locustfile, hostname, workers, testHost, numUsers, spawnRate) {
    result = await kubectl.start(namespace, instance, locustfile, hostname, workers, testHost, numUsers, spawnRate);
    if (result.service.response.statusCode == 201) {
        locust.instances[instance] = {
            name: instance,
            namespace: namespace,
            creationTimestamp: result.service.response.body.metadata.creationTimestamp,
            status: {
                'master': {
                    'replicas': 0,
                    'unavailableReplicas': 0,
                    'readyReplicas': 0,
                },
                'worker': {
                    'replicas': 0,
                    'unavailableReplicas': 0,
                    'readyReplicas': 0,
                },
            },
            locustfile: locustfile,
            testHost: testHost,
            numUsers: numUsers,
            spawnRate: spawnRate,
            worker: workers,
            ingressHost: hostname
        };
        socket.updatedStatus(locust.instances)
        console.log(locust);
    }
    debug('added');
}

async function removeLocust(namespace, instance) {
    result = await kubectl.stop(namespace, instance);
    if (result.deploymentMaster.response.statusCode == 200) {
        delete locust.instances[instance];
        socket.updatedStatus(locust.instances)
        console.log(locust);
    }
    debug('removed');
}


module.exports = {locust, startLoadtest, stopLoadtest, init, addLocust, removeLocust, addLocustfile, removeLocustfile};