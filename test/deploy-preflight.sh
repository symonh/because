#!/usr/bin/env bash
# Regression coverage for deploy.sh's fail-closed preflight. Every case runs
# in a throwaway repository with mocked Node/npm/Firebase entry points.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d "${TMPDIR:-/tmp}/because-deploy-preflight.XXXXXX")
trap 'rm -rf "$tmp"' EXIT

fail() { printf 'FAIL: %s\n' "$*" >&2; exit 1; }
expect_fail() {
	local name=$1
	shift
	if "$@" >"$tmp/$name.out" 2>&1; then fail "$name unexpectedly succeeded"; fi
}
expect_pass() {
	local name=$1
	shift
	"$@" >"$tmp/$name.out" 2>&1 || { cat "$tmp/$name.out" >&2; fail "$name unexpectedly failed"; }
}

make_case() {
	local name=$1 case_dir="$tmp/$1"
	mkdir -p "$case_dir/bin" "$case_dir/test" "$case_dir/figures" "$case_dir/deploy"
	cp "$root/deploy.sh" "$case_dir/deploy.sh"
	chmod +x "$case_dir/deploy.sh"
	printf 'sentinel\n' >"$case_dir/deploy/sentinel"
	git -C "$case_dir" init -q -b main
	git -C "$case_dir" config user.email deploy-test@example.invalid
	git -C "$case_dir" config user.name deploy-test
	printf 'seed\n' >"$case_dir/seed"
	git -C "$case_dir" add -f .
	git -C "$case_dir" commit -qm seed
	git init -q --bare "$tmp/$name.remote.git"
	git -C "$case_dir" remote add origin https://github.com/symonh/because.git
	git -C "$case_dir" remote add fixture "$tmp/$name.remote.git"
	git -C "$case_dir" push -q -u fixture main
	cat >"$case_dir/bin/node" <<'EOF'
#!/usr/bin/env bash
if [[ $1 == --version ]]; then printf '%s\n' "${BECAUSE_TEST_NODE_VERSION:-v22.12.0}"; exit 0; fi
[[ ${BECAUSE_TEST_FIGURE_FAIL:-} != 1 ]]
EOF
	cat >"$case_dir/bin/npm" <<'EOF'
#!/usr/bin/env bash
[[ -z ${BECAUSE_TEST_SUITES:-} ]] || exit 23
[[ ${BECAUSE_TEST_NPM_FAIL:-} != 1 ]]
EOF
	cat >"$case_dir/bin/npx" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >>"${BECAUSE_TEST_FIREBASE_LOG:?}"
exit 0
EOF
cat >"$case_dir/bin/git" <<EOF
#!/usr/bin/env bash
if [[ \${BECAUSE_TEST_FETCH_FAIL:-} == 1 && \${1:-} == fetch ]]; then exit 19; fi
if [[ \${1:-} == fetch ]]; then
	exec /usr/bin/git fetch --no-tags '$tmp/$name.remote.git' main:refs/remotes/origin/main
fi
exec /usr/bin/git "\$@"
EOF
	chmod +x "$case_dir/bin/node" "$case_dir/bin/npm" "$case_dir/bin/npx" "$case_dir/bin/git"
	git -C "$case_dir" add -f bin
	git -C "$case_dir" commit -qm 'test stubs'
	git -C "$case_dir" push -q fixture main
	printf '%s\n' "$case_dir"
}

run_preflight() {
	local case_dir=$1
	shift
	(
		cd "$case_dir"
		PATH="$case_dir/bin:$PATH" BECAUSE_DEPLOY_PREFLIGHT_ONLY=1 \
		BECAUSE_TEST_FIREBASE_LOG="$case_dir/firebase.log" "$@" ./deploy.sh
	)
}
assert_sentinel_untouched() {
	local case_dir=$1
	[[ $(cat "$case_dir/deploy/sentinel") == sentinel ]] || fail "staging sentinel changed in $case_dir"
	[[ ! -e "$case_dir/firebase.log" ]] || fail "Firebase was invoked in $case_dir"
}

dirty=$(make_case dirty)
printf 'dirty\n' >>"$dirty/seed"
expect_fail dirty run_preflight "$dirty"
assert_sentinel_untouched "$dirty"

nonmain=$(make_case nonmain)
git -C "$nonmain" checkout -qb feature
expect_fail nonmain run_preflight "$nonmain"
assert_sentinel_untouched "$nonmain"

wrong_origin=$(make_case wrong-origin)
git -C "$wrong_origin" remote set-url origin https://github.com/example/not-because.git
expect_fail wrong-origin run_preflight "$wrong_origin"
assert_sentinel_untouched "$wrong_origin"

url_rewrite=$(make_case url-rewrite)
git -C "$url_rewrite" config url.file:///tmp/not-the-canonical-repo.insteadOf https://github.com/
expect_fail url-rewrite run_preflight "$url_rewrite"
assert_sentinel_untouched "$url_rewrite"

stale=$(make_case stale)
git -C "$stale" commit --allow-empty -qm upstream
git -C "$stale" push -q fixture main
git -C "$stale" reset --hard -q HEAD~1
expect_fail stale run_preflight "$stale"
assert_sentinel_untouched "$stale"

fetch_fail=$(make_case fetch-fail)
expect_fail fetch-fail run_preflight "$fetch_fail" env BECAUSE_TEST_FETCH_FAIL=1
assert_sentinel_untouched "$fetch_fail"

failing_test=$(make_case failing-test)
expect_fail failing-test run_preflight "$failing_test" env BECAUSE_TEST_NPM_FAIL=1
assert_sentinel_untouched "$failing_test"

clean=$(make_case clean-exact-head)
expect_pass clean-exact-head run_preflight "$clean"
assert_sentinel_untouched "$clean"

override=$(make_case suite-override)
expect_pass suite-override run_preflight "$override" env BECAUSE_TEST_SUITES=runner-fixture.js
assert_sentinel_untouched "$override"

printf 'deploy preflight regressions passed\n'
