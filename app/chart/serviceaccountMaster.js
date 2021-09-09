serviceaccountMaster = {
    "apiVersion": "v1",
    "kind": "ServiceAccount",
    "metadata": {
        "name": "my-locust-master",
    },
    "secrets": [
        {
            "name": "my-locust-master-token-7wqlj"
        }
    ]
}


module.exports = serviceaccountMaster;