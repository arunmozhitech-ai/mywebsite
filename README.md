# AI/ML Study Hub

A React frontend with a Python backend for an Instagram AI/ML creator. Followers
can browse study materials, filter by topic, download uploaded files, and follow
a simple learning roadmap. The creator upload desk publishes PDFs, PPTs, DOCX,
XLSX, and ZIP files through the Python API.

## What Is Included

- Public landing page with generated AI-learning hero artwork.
- Animated profile card for G. ARUN MOZHI, AI/ML Engineer.
- Searchable study library with category, level, and file-type filters.
- Protected upload form for creator-only publishing.
- Python backend under `backend/app.py`.
- SQLite metadata storage under `backend/data/`.
- Local uploaded files under `backend/uploads/`.
- Instagram video series and learner roadmap sections.

## Local Commands

```bash
npm install
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
```

## Rancher / Kubernetes Deployment

This project now includes container and Rancher deployment files:

- `Dockerfile.frontend`
- `Dockerfile.backend`
- `k8s/rancher-deployment.yaml`
- `scripts/build-and-push-images.ps1`
- `scripts/deploy-rancher.ps1`

Start with `k8s/README.md` to build images, import the YAML in Rancher, and map
your Ingress host to the final public URL.

## Upload Configuration

Set `ADMIN_UPLOAD_KEY` before using the upload form. For local testing, the
default key is `change-this-before-deploying`.

Frontend API calls use:

- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`

The Python service runs with:

```bash
python backend/app.py
```

This local Python backend is separate from Sites hosting. If you later want this
online, deploy the React frontend and Python backend to hosting services that
support both parts.
