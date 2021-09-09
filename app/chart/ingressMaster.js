ingressMaster = {
    "apiVersion": "networking.k8s.io/v1",
    "kind": "Ingress",
    "metadata": {
        "labels": {
            "app.kubernetes.io/instance": "my-locust",
            "app.kubernetes.io/name": "locust",
            "app.kubernetes.io/version": "2.1.0",
            "helm.sh/chart": "locust-0.20.1",
            "load_test": "example"
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
