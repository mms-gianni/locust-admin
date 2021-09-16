
## Locust Swarm
[Locust](https://www.locust.io) is an easy to use, scriptable and scalable performance testing tool. But it is not very flexible. Specially when it comes to run multiple different configured loadtests in kubernetes cloud. 

This project solves this problem by adding a additional admin interface and API to dynamically start Locust instances in your kubernetes cluster.

All configurations are stored on your kubernetes cluster. 

## installation
The Helm installation is based on Deliveryhero's helm charts. 

```
helm install -f values.yaml test . -n locustswarm --create-namespace
```

## Environment variables
For a full list of available environment variables, please visit [.env.example](.env.example)

#### KUBECONFIG_BASE64 
A base64 encoded kubeconfig 
```
export KUBECONFIG_BASE64=$(cat kubeconfig | base64)
```
#### KUBECONFIG_PATH
Fallback if KUBECONFIG_PATH is empty

## Development 
### running a local KiND cluster
```
kind create cluster --config kind.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kind export kubeconfig --name superlocust --kubeconfig ./kubeconfig
```

### start on local node
```
cd client && npm run build && cd .. && npm run serve
```

### build a local docker image
```
docker-compose build
``` 

## Possible future features
- Store loadtest results in a database (MongoDB? or Prometheus? https://github.com/siimon/prom-client)
- Add provision support for other clouds (AWS, Google, Azure, Digital Ocean ... )


