const debug = require('debug')('superlocust:locust');
const kubectl = require('./kubectl');
const socket = require('./socket');

let locust = {
    instances: {},
    locustfiles: {},
};

// initial loading of all instances
async function init() {
  debug('loading');
  const result = await kubectl.list('ppp');
    result.services.response.body.items.forEach(element => {
        locust.instances[element.metadata.name] = {
            name: element.metadata.name,
            namespace: element.metadata.namespace,
            creationTimestamp: element.metadata.creationTimestamp,
        };
    });

    result.ingresses.response.body.items.forEach(element => {
        locust.instances[element.metadata.name.replace("-ingress", "")]['ingressHost'] = element.spec.rules[0].host;
    });
    result.deployments.response.body.items.forEach(element => {
        if (element.metadata.name.endsWith("-worker")) {
            locust.instances[element.metadata.name.replace("-worker", "")]['worker'] = element.spec.replicas;
        }
        if (element.metadata.name.endsWith("-master")) {
            masterinstance = element.metadata.name.replace("-master", "")
            locust.instances[masterinstance]['testHost'] = element.spec.template.spec.containers[0].env[0].value;
            locust.instances[masterinstance]['numUsers'] = element.spec.template.spec.containers[0].env[1].value;
            locust.instances[masterinstance]['spawnRate'] = element.spec.template.spec.containers[0].env[2].value;
            locust.instances[masterinstance]['locustfile'] = element.spec.template.spec.volumes[0].configMap.name;
        }
    });
    console.log(locust);
    debug('loaded');
}

async function addLocust(namespace, instance, locustfile, hostname, workers, testHost, numUsers, spawnRate) {
    result = await kubectl.start(namespace, instance, locustfile, hostname, workers, testHost, numUsers, spawnRate);
    if (result.service.response.statusCode == 201) {
        locust.instances[instance] = {
            name: instance,
            namespace: namespace,
            creationTimestamp: result.service.response.body.metadata.creationTimestamp,
            locustfile: locustfile,
            testHost: testHost,
            numUsers: numUsers,
            spawnRate: spawnRate,
            worker: workers,
            ingressHost: hostname
        };
        socket.updatedStatus(locust)
        console.log(locust);
    }
    debug('added');
}

async function removeLocust(namespace, instance) {
    result = await kubectl.stop(namespace, instance);
    if (result.deploymentMaster.response.statusCode == 200) {
        delete locust.instances[instance];
        socket.updatedStatus(locust)
        console.log(locust);
    }
    debug('removed');
}


module.exports = {locust, init, addLocust, removeLocust};