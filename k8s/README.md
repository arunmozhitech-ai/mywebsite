# Rancher Kubernetes Deployment

This folder contains a direct Rancher/Kubernetes deployment for AI/ML Study Hub.

## 1. Build and Push Images

Replace `ghcr.io/YOUR_GITHUB_USER` with your registry path.

```powershell
.\scripts\build-and-push-images.ps1 -Registry ghcr.io/YOUR_GITHUB_USER -Tag latest
```

The frontend image is built with `NEXT_PUBLIC_API_BASE_URL=""`, so browser API
calls use the same Ingress host and route `/api` to the Python backend.

## 2. Edit Deployment Values

Open `k8s/rancher-deployment.yaml` and replace:

- `ghcr.io/YOUR_GITHUB_USER/ai-ml-study-hub-frontend:latest`
- `ghcr.io/YOUR_GITHUB_USER/ai-ml-study-hub-backend:latest`
- `ai-ml-study-hub.example.com`
- `change-this-before-deploying`

Use a real `ADMIN_UPLOAD_KEY` before exposing the upload form publicly.

You can also render and apply the manifest in one step:

```powershell
.\scripts\deploy-rancher.ps1 -Registry ghcr.io/YOUR_GITHUB_USER -Tag latest -Hostname ai-ml-study-hub.example.com -AdminUploadKey "StudyHubUpload2026!"
```

If you let the script prompt for `ADMIN_UPLOAD_KEY`, type a normal password.
Do not enter `^V`; that is a terminal control character and Kubernetes will
reject the rendered YAML.

## 3. Deploy Through Rancher

In Rancher, open your cluster, choose **Import YAML**, paste the contents of
`k8s/rancher-deployment.yaml`, and apply it.

You can also deploy from a terminal configured for the same cluster:

```powershell
kubectl apply -f k8s/rancher-deployment.yaml
kubectl -n ai-ml-study-hub rollout status deployment/ai-ml-study-hub-backend
kubectl -n ai-ml-study-hub rollout status deployment/ai-ml-study-hub-frontend
```

## 4. Open the Site

Point DNS for your host to the Rancher Ingress/load balancer address. After that,
the site URL is:

```text
https://ai-ml-study-hub.example.com
```

For a quick private check without DNS:

```powershell
kubectl -n ai-ml-study-hub port-forward svc/ai-ml-study-hub-frontend 3000:80
```

Then open `http://localhost:3000`.

## Notes

- The backend uses SQLite and uploaded files on one persistent volume, so it runs
  as one replica. Move uploads and metadata to managed storage before scaling it.
- The Ingress allows uploads up to 55 MB to match the backend 50 MB limit.
- If your Rancher cluster uses a different Ingress class, change `ingressClassName`.
