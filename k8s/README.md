# locust swarmadmin

![Chart Version: 0.1.0](https://img.shields.io/badge/Chart_Version-0.1.0-informational?style=flat-square) 
![AppVersion: 0.1.0](https://img.shields.io/badge/App_Version-0.1.0-informational?style=flat-square)
![Locust Version: 0.1.0](https://img.shields.io/badge/Locust_Version-2.4.0-informational?style=flat-square)

[Locust](https://www.locust.io) is an easy to use, scriptable and scalable performance testing tool. But it is not very flexible. Specially when it comes to run multiple different configured loadtests on a kubernetes cloud. 

This chart will setup everything required to run the locust swarmadmin which is able to start multiple locust environment with any amount of workers. It comes with a simple to use web UI and a API. 

![Swarmadmin Screenshot](https://raw.githubusercontent.com/mms-gianni/swarmadmin/master/docs/swarmadmin.png) 

## Installation on Kubernetes

The results are exported and stored in Prometheus. They can easily be displayed on a grafana board ( ID: 15109 )

https://grafana.com/grafana/dashboards/15109

![Grafana Screenshot](https://raw.githubusercontent.com/mms-gianni/swarmadmin/master/docs/grafana.png)


## How to install this chart
The Helm installation is based on [Deliveryhero's](https://github.com/deliveryhero/helm-charts/tree/master/stable/locust) helm charts. (Version ~0.20.2)

Installation from git repo
```console
cd k8s/
helm install -f values.yaml my-release . -n locustswarm --create-namespace
helm upgrade -f values.yaml my-release .
```


Add Delivery Hero public chart repo:

```console
helm repo add swarmadmin https://mms-gianni.github.io/swarmadmin
```

A simple install with default values:

```console
helm install swarmadmin/swarmadmin
```

To install the chart with the release name `my-release`:

```console
helm install my-release swarmadmin/swarmadmin
```

To install with some set values:

```console
helm install my-release swarmadmin/swarmadmin --set values_key1=value1 --set values_key2=value2
```

To install with custom values file:

```console
helm install my-release swarmadmin/swarmadmin -f values.yaml
```