ingressMaster = {
    "apiVersion": "networking.k8s.io/v1",
    "kind": "Ingress",
    "metadata": {
        "labels": {
            "app.kubernetes.io/name": "locustswarm",
            "app.kubernetes.io/part-of": "swarm",
            "app.kubernetes.io/managed-by": "swarmadmin",
            "component": "master",
            "instance": "example"
        },
        "name": "my-locust",
    },
    "spec": {
        "rules": [
            {
                "host": "chart-example.local",
                "http": {
                    "paths": [
                        {
                            "backend": {
                                "service": {
                                    "name": "my-locust",
                                    "port": {
                                        "number": 8089
                                    }
                                }
                            },
                            "path": "/",
                            "pathType": "ImplementationSpecific"
                        }
                    ]
                }
            }
        ]
    }
}

module.exports = ingressMaster;
