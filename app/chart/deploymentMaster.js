deploymentMaster = {
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
        "labels": {
            "app.kubernetes.io/name": "locustswarm",
            "app.kubernetes.io/part-of": "swarm",
            "app.kubernetes.io/managed-by": "swarmadmin",
            "component": "master",
            "instance": "example"
        },
        "annotations": {},
        "name": "my-locust-master",
    },
    "spec": {
        "replicas": 1,
        "selector": {
            "matchLabels": {
                "app.kubernetes.io/name": "locustswarm",
                "app.kubernetes.io/part-of": "swarm",
                "app.kubernetes.io/managed-by": "swarmadmin",
                "component": "master",
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
                    "component": "master",
                    "instance": "example"
                }
            },
            "spec": {
                "containers": [
                    {
                        "args": [
                            "--master"
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
                                "name": "LOCUST_LOGLEVEL",
                                "value": "INFO"
                            },
                            {
                                "name": "LOCUST_LOCUSTFILE",
                                "value": "/mnt/locust/main.py"
                            }
                        ],
                        "image": "locustio/locust:2.1.0",
                        "name": "locust",
                        "ports": [
                            {
                                "containerPort": 8089,
                                "name": "loc-master-web",
                                "protocol": "TCP"
                            },
                            {
                                "containerPort": 5557,
                                "name": "loc-master-p1",
                                "protocol": "TCP"
                            },
                            {
                                "containerPort": 5558,
                                "name": "loc-master-p2",
                                "protocol": "TCP"
                            }
                        ],
                        "readinessProbe": {
                            "failureThreshold": 2,
                            "httpGet": {
                                "path": "/",
                                "port": 8089,
                                "scheme": "HTTP"
                            },
                            "initialDelaySeconds": 5,
                            "periodSeconds": 3,
                            "successThreshold": 1,
                            "timeoutSeconds": 30
                        },
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

module.exports = deploymentMaster;