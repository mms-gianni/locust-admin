service = {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": "my-locust",
        },
        "spec": {
            "ipFamilyPolicy": "SingleStack",
            "ports": [
                {
                    "name": "master-p1",
                    "port": 5557,
                    "protocol": "TCP",
                    "targetPort": 5557
                },
                {
                    "name": "master-p2",
                    "port": 5558,
                    "protocol": "TCP",
                    "targetPort": 5558
                },
                {
                    "name": "master-p3",
                    "port": 8089,
                    "protocol": "TCP",
                    "targetPort": 8089
                }
            ],
            "selector": {
                "app.kubernetes.io/instance": "my-locust",
                "app.kubernetes.io/name": "locust",
                "component": "master"
            },
            "sessionAffinity": "None",
            "type": "ClusterIP"
        },
        "status": {
            "loadBalancer": {}
        }
    }

module.exports = service;