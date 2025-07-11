PROJECT_ID="quixotic-prism-465319-f8"
REPO_ID="dock-repo"
SERVICE_NAME="code-dock"
IMAGE_NAME="code-dock"
REGION_NAME="us-central1"
LOCATION_NAME="us"
#These do not work without proper gcloud auth first
echo "Authorizing Deployment..."
gcloud auth login
gcloud auth configure-docker us-docker.pkg.dev

echo "▶ Ensuring Repo exists... Error means existing"
gcloud artifacts repositories create ${REPO_ID} \
  --repository-format=docker \
  --location=${LOCATION_NAME}

echo "▶ Building Image $SERVICE_NAME…"
docker buildx build --platform linux/amd64 -t \
  us-docker.pkg.dev/$PROJECT_ID/$REPO_ID/$IMAGE_NAME:latest --push .

echo "▶ Deploying Cloud Run service $SERVICE_NAME…"
gcloud run deploy code-dock \
  --image us-docker.pkg.dev/$PROJECT_ID/${REPO_ID}/${IMAGE_NAME}:latest \
  --region ${REGION_NAME}

echo "▶ Connecting and running Python code..."

SERVICE_URL=$(gcloud run services describe code-dock \
  --region us-central1 --format='value(status.url)')
echo "$SERVICE_URL"

TOKEN=$(gcloud auth print-identity-token)

curl -X POST "$SERVICE_URL/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Python code ran in container.\")","stdin":"","tests":null}'
