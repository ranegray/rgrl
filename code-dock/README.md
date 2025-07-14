code-dock is a docker containe designed for deployment on GCP that runs code for the Click & Whirr web coding UI. Currently supports regular Python with plans for additional ROS support and expansion as needed.

Can be tested locally or put up into cloud.

Local deploy:

Build:
docker buildx build --platform linux/arm64 -t code-dock:latest . --no-cache

Run:
docker run --rm -p 8080:8080 code-dock

Separate Terminal:
curl -X POST http://localhost:8080/execute \
     -H "Content-Type: application/json" \
     -d '{"code": "print(40 + 2)"}'

Test local with file:

FILE="test.py"
curl -X POST http://localhost:8080/execute \
     -H "Content-Type: application/json" \
     --data "$(jq -Rs --arg stdin '' '{code: ., stdin: $stdin, tests: null}' < "$FILE")"

Hopefully will work in cloud with JSON stringify.

Deploying to GCP Cloud:

Make sure the cloud account is correct and authenticated:
gcloud auth login

Configure docker:
gcloud auth configure-docker us-docker.pkg.dev

chmod both scripts:
chmod +x deploy.sh 
chmod + delete_dock.sh


Run deploy.sh

Testing cloud container:

Get Service URL:

SERVICE_URL=$(gcloud run services describe code-dock \
               --region us-central1 --format='value(status.url)')
echo "$SERVICE_URL"

TOKEN=$(gcloud auth print-identity-token)

curl -X POST "$SERVICE_URL/execute" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"code":"print(\"Python code ran in container.\")","stdin":"","tests":null}'

Remove container with delete-dock.sh

For sending an entire file:

FILE="myprog.py"
curl -X POST "$SERVICE_URL/execute" \
     -H "Content-Type: application/json" \
     --data "$(jq -Rs --arg stdin '' '{code: ., stdin: $stdin, tests: null}' < "$FILE")"
