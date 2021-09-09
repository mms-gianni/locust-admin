serviceaccountWorker = {
    "apiVersion": "v1",
    "kind": "ServiceAccount",
    "metadata": {
        "name": "my-locust-worker",
    },
    "secrets": [
        {
            "name": "my-locust-worker-token-96lrm"
        }
    ]
}
module.exports = serviceaccountWorker;