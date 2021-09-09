deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
        name: 'locust',
        labels: {
            app: 'locust'
        }
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: {
                app: 'locust'
            }
        },
        strategy: {
            rollingUpdate: {
                maxSurge: "25%",
                maxUnavailable: "25%"
            },
            type: "RollingUpdate"
        },
        template: {
            metadata: {
                labels: {
                    app: 'locust'
                }
            },
            spec: {
                containers: [
                    {
                        name: 'locust',
                        imagePullPolicy: "IfNotPresent",
                        image: 'locustio/locust:2.1.0',
                        args: [
                            '--master'
                        ],
                        env: [
                            {
                                name: "LOCUST_HOST",
                                value: "https://www.google.com"
                            },
                            {
                                name: "LOCUST_LOGLEVEL",
                                value: "INFO"
                            },
                            {
                                name: "LOCUST_LOCUSTFILE",
                                value: "/mnt/locust/main.py"
                            }
                        ],
                        command: [
                            "sh",
                            "/config/docker-entrypoint.sh"
                        ],
                    }
                ]
            }
        }
    }
}

module.exports = deployment;