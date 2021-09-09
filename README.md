



## running a local cluster
kind create cluster --config kind.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kind export kubeconfig --name superlocust --kubeconfig ./kubeconfig
