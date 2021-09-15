const debug = require('debug')('superlocust:watcher');
const kubectl = require('./kubectl');

function checkStatus(data) {
    console.log(data);
}

function watcher(status) {
    const namespace = process.env.NAMESPACE || 'default';
    kubectl.list(namespace).then(function(data) {
        data.deployments.body.items.forEach(element => {
            // Load data status master
            if (element.metadata.name.endsWith('-master')) {
                let MasterName = element.metadata.name.replace("-master", "")
                status.instances[MasterName].status.master.replicas = element.status.replicas;
                status.instances[MasterName].status.master.unavailableReplicas = element.status.unavailableReplicas;
                status.instances[MasterName].status.master.availableReplicas = element.status.replicas - element.status.unavailableReplicas;
            }
            // Load data status worker
            if (element.metadata.name.endsWith('-worker')) {

                let workerName = element.metadata.name.replace("-worker", "")
                status.instances[workerName].status.worker.replicas = element.status.replicas;
                status.instances[workerName].status.worker.unavailableReplicas = element.status.unavailableReplicas;
                status.instances[workerName].status.worker.availableReplicas = element.status.replicas - element.status.unavailableReplicas;
            }
        });
    }).catch(function(err) {
        debug(err);
    });
    
    //console.log(status);
    console.log("pull run");
    debug(status);
}

module.exports = watcher;
