#!/bin/bash
set -e

DHIS2_URL="http://localhost:8081"
DHIS2_USER="admin"
DHIS2_PASS="district"
APP_NAME="reports-navigator"

echo "==> Building..."
npm run build

echo "==> Packing..."
npm run pack

ZIP=$(ls *.zip | head -1)
if [ -z "$ZIP" ]; then
  echo "ERROR: No zip file found after pack." >&2
  exit 1
fi

echo "==> Deploying $ZIP to $DHIS2_URL..."
curl -sf -u "$DHIS2_USER:$DHIS2_PASS" \
  -F "file=@$ZIP" \
  "$DHIS2_URL/api/apps" \
  -o /dev/null

echo "==> Done. Open $DHIS2_URL/api/apps/$APP_NAME to verify."
echo "==> If manifest fields changed (name/icon), run: docker compose restart dhis2 (from src/dhis2-new/)"
