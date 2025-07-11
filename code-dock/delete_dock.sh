PROJECT_ID="quixotic-prism-465319-f8"
SERVICE_NAME="code-dock"
REGION_NAME="us-central1"
LOCATION_NAME="us"

echo "▶ Deleting Cloud Run service $SERVICE_NAME…"
gcloud run services delete "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION_NAME" \
  --quiet || echo "Service already gone."
