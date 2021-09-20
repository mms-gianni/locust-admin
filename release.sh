
#!/bin/bash
helm lint k8s 
helm package -d docs k8s
helm repo index docs --url https://mms-gianni.github.io/swarmadmin