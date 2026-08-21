#!/usr/bin/env bash
# Deploy Because to Firebase Hosting (https://app.philmaps.com).
#
# This deliberately deploys only a checked, exact copy of origin/main. It
# never pushes: publishing source and publishing the hosted build are separate.
set -euo pipefail

cd "$(dirname "$0")"

die() {
	printf 'deploy preflight failed: %s\n' "$*" >&2
	exit 1
}

canonical_origin() {
	local url=$1
	url=${url%/}
	url=${url%.git}
	case "$url" in
		https://github.com/symonh/because|git@github.com:symonh/because|ssh://git@github.com/symonh/because)
			printf 'github.com/symonh/because\n'
			;;
		*) return 1 ;;
	esac
}

require_node() {
	local version major minor
	version=$(node --version 2>/dev/null) || die 'Node.js >=22.12.0 is required'
	version=${version#v}
	if [[ ! $version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
		die "could not parse Node.js version: $version"
	fi
	major=${BASH_REMATCH[1]}
	minor=${BASH_REMATCH[2]}
	if (( major < 22 || (major == 22 && minor < 12) )); then
		die "Node.js >=22.12.0 is required (found $version)"
	fi
}

if [[ -n $(git status --porcelain) ]]; then
	die 'working tree is dirty'
fi
[[ $(git branch --show-current) == main ]] || die 'current branch is not main'

# Git URL rewriting can make a canonical-looking remote fetch from somewhere
# else. Deployment is intentionally stricter than normal development: reject
# any active rewrite rather than trying to infer whether it is harmless.
if git config --get-regexp '^url\..*\.insteadof$' >/dev/null 2>&1; then
	die 'Git URL rewrites are not allowed for deploy'
fi

origin_url=$(git remote get-url origin 2>/dev/null) || die 'origin remote is missing'
canonical_origin "$origin_url" >/dev/null || die "origin fetch URL is not github.com/symonh/because: $origin_url"

git fetch --no-tags origin main || die 'could not fetch origin/main'
head=$(git rev-parse HEAD)
origin_main=$(git rev-parse refs/remotes/origin/main 2>/dev/null) || die 'origin/main is unavailable after fetch'
[[ $head == "$origin_main" ]] || die 'HEAD is not exactly origin/main'

require_node

# The normal test runner owns the documented browser coverage and server
# lifecycle. Keep this command canonical so deploy and CI cannot drift.
(cd test && env -u BECAUSE_TEST_SUITES npm test)
node figures/build.mjs --check

if [[ ${BECAUSE_DEPLOY_PREFLIGHT_ONLY:-} == 1 ]]; then
	printf 'deploy preflight passed for %s\n' "$head"
	exit 0
fi

# Stage only public assets. samples-local/ and refs-local/ must never ship.
rm -rf deploy
mkdir -p deploy
rsync -a app deploy/
rsync -a samples deploy/
rsync -a site/ deploy/ # root-level pages: /privacy, /terms (cleanUrls)

# Stamp the deployed analytics module; the repository source remains 'dev'.
commit=$(git rev-parse --short HEAD)
sed -i '' "s/APP_VERSION = 'dev'/APP_VERSION = '${commit}'/" deploy/app/js/analytics.js

GOOGLE_CLOUD_QUOTA_PROJECT=driveshare-446802 \
	npx --yes firebase-tools@15.27.0 deploy --only hosting:argumentbase --project driveshare-446802
