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

# Keep GitHub in lockstep with what goes live. Push the current branch to
# origin BEFORE building/deploying, so a push that can't fast-forward
# (diverged, or the local branch is behind) aborts the whole deploy under
# `set -e` — the live site can never get ahead of the repo again. The deploy
# stamps HEAD as APP_VERSION, so the commit that identifies the live build is
# the same commit that's on GitHub. (Firebase + GCS ship, but never git — a
# 37-commit drift once built up exactly this way.)
branch=$(git rev-parse --abbrev-ref HEAD)
if [ -n "$(git status --porcelain)" ]; then
	echo "warning: working tree has uncommitted changes. The live site rsyncs"
	echo "         the working tree, but only committed history is pushed, so"
	echo "         GitHub will not match what ships. Commit first to keep them"
	echo "         in sync."
fi
echo "Pushing ${branch} to origin before deploy…"
git push origin "$branch"

rm -rf deploy
mkdir -p deploy
rsync -a app deploy/
rsync -a samples deploy/
rsync -a site/ deploy/   # root-level pages: /privacy, /terms (cleanUrls)

# stamp the deployed analytics module with the commit it came from, so GA's
# app_version dimension identifies exactly what was live (repo copy stays 'dev')
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)
sed -i '' "s/APP_VERSION = 'dev'/APP_VERSION = '${COMMIT}'/" deploy/app/js/analytics.js

GOOGLE_CLOUD_QUOTA_PROJECT=driveshare-446802 \
	npx --yes firebase-tools deploy --only hosting:argumentbase --project driveshare-446802
