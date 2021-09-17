deploymentWorker = {
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
        "labels": {
            "app.kubernetes.io/name": "locustswarm",
            "app.kubernetes.io/part-of": "swarm",
            "app.kubernetes.io/managed-by": "swarmadmin",
            "component": "worker",
            "instance": "example"
        },
        "name": "my-locust-worker",
    },
    "spec": {
        "progressDeadlineSeconds": 600,
        "replicas": 1,
        "revisionHistoryLimit": 10,
        "selector": {
            "matchLabels": {
                "app.kubernetes.io/name": "locustswarm",
                "app.kubernetes.io/part-of": "swarm",
                "app.kubernetes.io/managed-by": "swarmadmin",
                "component": "worker",
                "instance": "example"
            }
        },
        "strategy": {
            "rollingUpdate": {
                "maxSurge": "25%",
                "maxUnavailable": "25%"
            },
            "type": "RollingUpdate"
        },
        "template": {
            "metadata": {
                "labels": {
                    "app.kubernetes.io/name": "locustswarm",
                    "app.kubernetes.io/part-of": "swarm",
                    "app.kubernetes.io/managed-by": "swarmadmin",
                    "component": "worker",
                    "instance": "example"
                }
            },
            "spec": {
                "containers": [
                    {
                        "args": [
                            "--worker"
                        ],
                        "command": [
                            "sh",
                            "/config/docker-entrypoint.sh"
                        ],
                        "env": [
                            {
                                "name": "LOCUST_HOST",
                                "value": "https://www.google.com"
                            },
                            {
                                "name": "LOCUST_USERS",
                                "value": "1"
                            },
                            {
                                "name": "LOCUST_SPAWN_RATE",
                                "value": "1"
                            },
                            {
                                "name": "LOCUST_MASTER_NODE_HOST",
                                "value": "my-locust"
                            },
                            {
                                "name": "LOCUST_MASTER_NODE_PORT",
                                "value": "5557"
                            },
                            {
                                "name": "LOCUST_LOGLEVEL",
                                "value": "INFO"
                            },
                            {
                                "name": "LOCUST_LOCUSTFILE",
                                "value": "/mnt/locust/main.py"
                            }
                        ],
                        "image": "locustio/locust:2.1.0",
                        "imagePullPolicy": "IfNotPresent",
                        "name": "locust",
                        "resources": {},
                        "securityContext": {},
                        "terminationMessagePath": "/dev/termination-log",
                        "terminationMessagePolicy": "File",
                        "volumeMounts": [
                            {
                                "mountPath": "/mnt/locust",
                                "name": "locustfile"
                            },
                            {
                                "mountPath": "/mnt/locust/lib",
                                "name": "lib"
                            },
                            {
                                "mountPath": "/config",
                                "name": "config"
                            }
                        ]
                    }
                ],
                "dnsPolicy": "ClusterFirst",
                "restartPolicy": "Always",
                "schedulerName": "default-scheduler",
                "securityContext": {},
                "terminationGracePeriodSeconds": 30,
                "volumes": [
                    {
                        "configMap": {
                            "defaultMode": 420,
                            "name": "my-locust-locustfile"
                        },
                        "name": "locustfile"
                    },
                    {
                        "configMap": {
                            "defaultMode": 420,
                            "name": "default-lib"
                        },
                        "name": "lib"
                    },
                    {
                        "configMap": {
                            "defaultMode": 420,
                            "name": "default-config"
                        },
                        "name": "config"
                    }
                ]
            }
        }
    }
}
module.exports = deploymentWorker;