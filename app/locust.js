const debug = require('debug')('superlocust:locust');
const kubectl = require('./kubectl');

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
            namespace: element.metadata.namespace
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

module.exports = {locust, init};