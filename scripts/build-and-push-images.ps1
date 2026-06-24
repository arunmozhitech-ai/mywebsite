param(
  [Parameter(Mandatory = $true)]
  [string]$Registry,

  [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"

$frontendImage = "$Registry/ai-ml-study-hub-frontend:$Tag"
$backendImage = "$Registry/ai-ml-study-hub-backend:$Tag"

docker build `
  -f Dockerfile.frontend `
  --build-arg NEXT_PUBLIC_API_BASE_URL="" `
  -t $frontendImage `
  .

docker build `
  -f Dockerfile.backend `
  -t $backendImage `
  .

docker push $frontendImage
docker push $backendImage

Write-Host "Pushed:"
Write-Host "  $frontendImage"
Write-Host "  $backendImage"
