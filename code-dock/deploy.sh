#!/bin/bash

set -e

PROJECT_ID="quixotic-prism-465319-f8"
REPO_ID="dock-repo"
SERVICE_NAME="code-dock"
IMAGE_NAME="code-dock"
REGION_NAME="us-central1"
LOCATION_NAME="us"
IMAGE_URI="us-docker.pkg.dev/$PROJECT_ID/$REPO_ID/$IMAGE_NAME:latest"

# Optional: Only login if needed
if ! gcloud auth list --format="value(account)" | grep -q "@"; then
  echo "🔑 Authorizing gcloud..."
  gcloud auth login
fi

echo "🔧 Configuring Docker with Artifact Registry..."
gcloud auth configure-docker us-docker.pkg.dev --quiet

echo "📦 Ensuring Artifact Registry repo exists..."
gcloud artifacts repositories describe $REPO_ID \
  --location=$LOCATION_NAME ||
  gcloud artifacts repositories create $REPO_ID \
    --repository-format=docker \
    --location=$LOCATION_NAME

echo "🏗️  Building Docker image for $SERVICE_NAME..."
docker buildx build --platform linux/amd64 -t $IMAGE_URI --push .

echo "🚀 Deploying $SERVICE_NAME to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URI \
  --allow-unauthenticated \
  --region $REGION_NAME

echo "🌐 Getting service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION_NAME --format='value(status.url)')
echo "✅ Deployed at: $SERVICE_URL"

echo "🐍 Running test code via Cloud Run..."
TOKEN=$(gcloud auth print-identity-token)

curl -X POST "$SERVICE_URL/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Python code ran in container.\")","stdin":"","tests":null}'
