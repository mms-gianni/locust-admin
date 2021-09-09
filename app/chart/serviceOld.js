service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
        name: 'locust',
        labels: {
            app: 'locust'
        }
    },
    spec: {
        type: 'LoadBalancer',
        ports: [
            {
                port: 80,
                targetPort: 80
            }
        ],
        selector: {
            app: 'locust'
        }
    }
}

module.exports = service;