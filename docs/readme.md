## Notes
- Kubernetes expects that application components can be started in any order

## EKS
- eksctl create cluster --region=eu-west-2 --name=knote
- kubectl get nodes
- kubectl apply -f kube
- kubectl get pods --watch
- kubectl get service knote
- kubectl scale --replicas=10 deployment knote
- kubectl get pods --all-namespaces
- eksctl delete cluster --region=eu-west-2 --name=knote