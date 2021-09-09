config = {
    "apiVersion": "v1",
    "kind": "ConfigMap",
    "metadata": {
        "labels": {
            "app.kubernetes.io/instance": "my-locust",
            "app.kubernetes.io/managed-by": "Helm",
            "app.kubernetes.io/name": "locust",
            "app.kubernetes.io/version": "2.1.0",
            "helm.sh/chart": "locust-0.20.1",
            "config": "config"
        },
        "name": "my-locust-config",
    },
    "data": {
        "docker-entrypoint.sh": "#!/bin/sh\n\nset -eu\n\nexec /usr/local/bin/locust $@\n"
    }
}

module.exports = config;