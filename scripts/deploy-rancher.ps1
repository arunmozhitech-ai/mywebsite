param(
  [Parameter(Mandatory = $true)]
  [string]$Registry,

  [string]$Tag = "latest",

  [string]$Hostname = "ai-ml-study-hub.example.com",

  [string]$AdminUploadKey
)

$ErrorActionPreference = "Stop"

if (-not $AdminUploadKey) {
  $AdminUploadKey = Read-Host "Enter ADMIN_UPLOAD_KEY"
}

$Registry = $Registry.TrimEnd("/")

if ([string]::IsNullOrWhiteSpace($AdminUploadKey)) {
  throw "ADMIN_UPLOAD_KEY cannot be empty."
}

if ($AdminUploadKey -match "[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]") {
  throw "ADMIN_UPLOAD_KEY contains a terminal control character. Type a normal password such as StudyHubUpload2026! or pass it with -AdminUploadKey."
}

$frontendImage = "$Registry/ai-ml-study-hub-frontend:$Tag"
$backendImage = "$Registry/ai-ml-study-hub-backend:$Tag"
$manifestPath = Join-Path $PSScriptRoot "..\k8s\rancher-deployment.yaml"
$renderedPath = Join-Path $env:TEMP "ai-ml-study-hub-rancher.yaml"
$escapedAdminUploadKey = $AdminUploadKey.Replace("'", "''")

$manifest = Get-Content -Raw $manifestPath
$manifest = $manifest.Replace("ghcr.io/YOUR_GITHUB_USER/ai-ml-study-hub-frontend:latest", $frontendImage)
$manifest = $manifest.Replace("ghcr.io/YOUR_GITHUB_USER/ai-ml-study-hub-backend:latest", $backendImage)
$manifest = $manifest.Replace("ai-ml-study-hub.example.com", $Hostname)
$manifest = $manifest.Replace('ADMIN_UPLOAD_KEY: "change-this-before-deploying"', "ADMIN_UPLOAD_KEY: '$escapedAdminUploadKey'")

Set-Content -Path $renderedPath -Value $manifest -Encoding utf8

kubectl apply -f $renderedPath
if ($LASTEXITCODE -ne 0) {
  throw "kubectl apply failed. The rollout checks were not run."
}

kubectl -n ai-ml-study-hub rollout status deployment/ai-ml-study-hub-backend
if ($LASTEXITCODE -ne 0) {
  throw "Backend rollout failed."
}

kubectl -n ai-ml-study-hub rollout status deployment/ai-ml-study-hub-frontend
if ($LASTEXITCODE -ne 0) {
  throw "Frontend rollout failed."
}

Write-Host "Deployment applied."
Write-Host "Site URL: https://$Hostname"
