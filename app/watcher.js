const debug = require('debug')('superlocust:watcher');
const kubectl = require('./kubectl');
const axios = require('axios');
const { locust, removeLocust } = require('./locust');

function loadStats(status) {
    for (let i in status.instances) {
        let instance = status.instances[i];
        let name = instance.name;

        if (instance.status.master.readyReplicas > 0) {
            let instanceURL = `http://${instance.name}:8089`;
            if (process.env.EXTERNAL_PORT) {
                instanceURL = `http://${instance.ingressHost}:${process.env.EXTERNAL_PORT}`;
            }
            axios.get(`${instanceURL}/stats/requests`).then(function(response) {
                status.instances[name].stats = response.data;
            }).catch(function(error) {
                //console.log(error);
                console.log("load data error");
            });
        }
    }
}

async function watcher(status) {
    const namespace = process.env.NAMESPACE || 'default';
    await kubectl.list(namespace).then(function(data) {
        data.deployments.body.items.forEach(element => {
            // Load data status master
            if (element.metadata.name.endsWith('-master')) {
                let MasterName = element.metadata.name.replace("-master", "")
                status.instances[MasterName].status.master.replicas = element.status.replicas;
                status.instances[MasterName].status.master.unavailableReplicas = element.status.unavailableReplicas || 0;
                status.instances[MasterName].status.master.readyReplicas = element.status.readyReplicas || 0;
            }
            // Load data status worker
            if (element.metadata.name.endsWith('-worker')) {

                let workerName = element.metadata.name.replace("-worker", "")
                status.instances[workerName].status.worker.replicas = element.status.replicas;
                status.instances[workerName].status.worker.unavailableReplicas = element.status.unavailableReplicas || 0;
                status.instances[workerName].status.worker.readyReplicas = element.status.readyReplicas || 0;
            }
        });
    }).catch(function(err) {
        debug(err);
    });
    loadStats(status);
    autodelete(status);
    debug(status);
}

function autodelete(status) {
    for (let i in status.instances) {
        let instance = status.instances[i];
        if (instance.autodelete && 
            instance.status.master && 
            instance.status.master.readyReplicas > 0 &&
            instance.stats && 
            (instance.stats.state == 'stopping' || instance.stats.state == 'stopped')
            ) {
            removeLocust(instance.namespace, instance.name);
            console.log("autodelete");
        }
    }
}

module.exports = watcher;
