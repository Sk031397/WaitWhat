#!/usr/bin/env bash
# Deploy the /ask Lambda (sidekick-ask) behind the existing HTTP API.
#
#   cd backend && ./deploy.sh
#
# Builds a prod-only zip, updates the function code + env, throttles the API
# stage, and caps Lambda concurrency. The endpoint is public (no key): the
# throttle and concurrency cap are the cost guard.
#
# Rollback: version 1 of sidekick-ask is a published snapshot of the pre-fix
# code. Restore it with:
#   curl -so /tmp/v1.zip "$(aws lambda get-function --function-name sidekick-ask:1 \
#     --region us-east-1 --query Code.Location --output text)"
#   aws lambda update-function-code --function-name sidekick-ask --region us-east-1 \
#     --zip-file fileb:///tmp/v1.zip
set -euo pipefail

FN=sidekick-ask
API_ID=u7ycv4t5kc
REGION=us-east-1
MODEL=us.amazon.nova-lite-v1:0   # multimodal: reads the video frames
BUCKET=sidekickvegaos
HERE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$(mktemp -d)"
ZIP="$STAGE.zip"

echo "Building..."
(cd "$HERE" && rm -rf dist && npx tsc -p .)
cp "$HERE/dist/handler.js" "$HERE/dist/types.js" "$HERE/package.json" "$HERE/package-lock.json" "$STAGE/"
(cd "$STAGE" && npm ci --omit=dev --no-audit --no-fund --ignore-scripts >/dev/null \
  && rm package.json package-lock.json && zip -qr "$ZIP" .)

echo "Updating code..."
aws lambda update-function-code --function-name "$FN" --region "$REGION" \
  --zip-file "fileb://$ZIP" --query LastUpdateStatus --output text
aws lambda wait function-updated --function-name "$FN" --region "$REGION"

echo "Updating env..."
aws lambda update-function-configuration --function-name "$FN" --region "$REGION" \
  --environment "Variables={BEDROCK_MODEL_ID=$MODEL,MEDIA_BUCKET=$BUCKET}" \
  --query LastUpdateStatus --output text
aws lambda wait function-updated --function-name "$FN" --region "$REGION"

echo "Throttling API stage (5 req/s, burst 10)..."
aws apigatewayv2 update-stage --api-id "$API_ID" --stage-name '$default' --region "$REGION" \
  --default-route-settings ThrottlingRateLimit=5,ThrottlingBurstLimit=10 >/dev/null

echo "Capping Lambda concurrency at 5..."
aws lambda put-function-concurrency --function-name "$FN" --region "$REGION" \
  --reserved-concurrent-executions 5 >/dev/null \
  || echo "  (skipped: account concurrency limit too low to reserve; throttling still applies)"

echo "Smoke test..."
URL="https://$API_ID.execute-api.$REGION.amazonaws.com/ask"
BODY='{"mode":"general","question":"What is happening right now?","content":{"title":"Tears of Steel","contentType":"movie","synopsis":"A sci-fi short set in a future Amsterdam.","positionSeconds":30,"videoId":"tears-of-steel"}}'
echo -n "  -> "; curl -s -X POST "$URL" -H 'Content-Type: application/json' -d "$BODY"; echo

rm -rf "$STAGE" "$ZIP"
echo "Done."
