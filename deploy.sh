#!/bin/bash
# Deploy Because to Firebase Hosting (https://app.philmaps.com,
# also argumentbase.web.app — the site keeps its legacy id).
#
# Stages exactly app/, samples/, and site/ into deploy/ before uploading,
# so the gitignored course content (samples-local/, refs-local/) can never
# ship. Auth comes from gcloud application-default credentials
# (sc@simoncullen.org).
set -euo pipefail
cd "$(dirname "$0")"

rm -rf deploy
mkdir -p deploy
rsync -a app deploy/
rsync -a samples deploy/
rsync -a site/ deploy/   # root-level pages: /privacy, /terms (cleanUrls)

GOOGLE_CLOUD_QUOTA_PROJECT=driveshare-446802 \
	npx --yes firebase-tools deploy --only hosting:argumentbase --project driveshare-446802

# secondary mirror (legacy URL): GCS bucket
if command -v gcloud >/dev/null; then
	gcloud storage rsync --recursive --cache-control="no-cache" deploy/app gs://argumentbase-app/app
	gcloud storage rsync --recursive --cache-control="no-cache" deploy/samples gs://argumentbase-app/samples
fi
