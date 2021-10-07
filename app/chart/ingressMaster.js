// TODO: Create apiVersion by Kubernetes Version
ingressMaster = {
    "apiVersion": "extensions/v1beta1",
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
