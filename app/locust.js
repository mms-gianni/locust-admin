const debug = require('debug')('superlocust:locust');
const kubectl = require('./kubectl');
const socket = require('./socket');
const axios = require('axios');

let locust = {
    instances: {},
    locustfiles: {},
};

async function startLoadtest(instanceName, userCount, spawnRate, host) {

    let data = {
        user_count: userCount,
        spawn_rate: spawnRate,
        host: host
    }

    const url = require('url');
    const params = new url.URLSearchParams(data);
    console.log(params);
    
    let instanceURL = `http://${instance.name}:8089`;
    if (process.env.EXTERNAL_PORT) {
        instanceURL = `http://${instance.ingressHost}:${process.env.EXTERNAL_PORT}`;
    }
    axios.get(`${instanceURL}/swarm`, params).then(function(response) {
        console.log(response.data);
    }).catch(function(error) {
        console.log(error);
        console.log("Start Swarm error");
    });
    return "ERROR"
}

async function stopLoadtest(instanceName) {
    let instanceURL = `http://${instance.name}:8089`;
    if (process.env.EXTERNAL_PORT) {
        instanceURL = `http://${instance.ingressHost}:${process.env.EXTERNAL_PORT}`;
    }
    axios.get(`${instanceURL}/stop`).then(function(response) {
        //console.log(response.data);
        return response.data
    }).catch(function(error) {
        //console.log(error);
        console.log("load data error");
        return "ERROR"
    });

}

// initial loading of all instances
async function init() {
    try {
        debug('loading');

        //load initial kubernetes version
        locust.kubeVersion = await kubectl.getKubeVersion();

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
    if (result.locustfiles.response.statusCode == 200) {
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

function getMetrics() {
    let ret_str = "";
    let running_instances = 0;
    const fields = [
        "avg_content_length",
        "avg_response_time",
        "current_fail_per_sec",
        "current_rps",
        "max_response_time",
        "median_response_time",
        "min_response_time",
        "ninetieth_response_time",
        "num_failures",
        "num_requests"
    ]
    for (var i in locust.instances) {
        let instance = locust.instances[i];
        if (instance.status.master.readyReplicas > 0 && 
            instance.status.worker.readyReplicas > 0 &&
            instance.stats != undefined &&
            instance.stats.state == 'running') {
            running_instances++;
            for (var s in instance.stats.stats) {
                let stat = instance.stats.stats[s];
                if (stat.safe_name === "Aggregated") { continue; }
                fields.forEach(field => {
                    let method = stat.method != null ? `method="${stat.method}" ` : "";
                    ret_str += `locust_${field} {locust_instance="${i}" ${method}name="${stat.safe_name}"} ${stat[field]}` + "\n";
                })
            }
            ret_str += `locust_user_count {locust_instance="${i}"} ${instance.stats.user_count}` + "\n";
            ret_str += `locust_fail_ratio {locust_instance="${i}"} ${instance.stats.fail_ratio}` + "\n";
            ret_str += `locust_current_response_time_percentile_50 {locust_instance="${i}"} ${instance.stats.current_response_time_percentile_50}` + "\n";
            ret_str += `locust_current_response_time_percentile_95 {locust_instance="${i}"} ${instance.stats.current_response_time_percentile_95}` + "\n";

            for (var w in instance.stats.workers) {
                let worker = instance.stats.workers[w];

                ret_str += `locust_cpu_usage {locust_instance="${i}", worker_id="${worker.id}"} ${worker.cpu_usage}` + "\n";
                ret_str += `locust_user_count {locust_instance="${i}", worker_id="${worker.id}"} ${worker.user_count}` + "\n";
            }
        }
        ret_str += `locust_workers {locust_instance="${i}"} ${instance.status.worker.readyReplicas}` + "\n";
        ret_str += `locust_requested_spawnRate {locust_instance="${i}"} ${instance.spawnRate}` + "\n";
        ret_str += `locust_requested_numUsers {locust_instance="${i}"} ${instance.numUsers}` + "\n";
        ret_str += `locust_requested_workers {locust_instance="${i}"} ${instance.worker}` + "\n";
    }
    ret_str += "locust_instances_total " + Object.keys(locust.instances).length + "\n";
    ret_str += "locust_instances_running " + running_instances + "\n";
    return ret_str;
}

module.exports = {
    locust, 
    startLoadtest, 
    stopLoadtest, 
    init, 
    addLocust, 
    removeLocust, 
    addLocustfile, 
    removeLocustfile, 
    getMetrics
};