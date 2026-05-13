#!/usr/bin/env sh

set -e

cli_path="$1"
token="$2"
test_tarball="${3:-false}"

# Optional: absolute path to a docs fixture directory (must contain a `fern/`
# subdirectory with a docs.yml). When set, runs `fern generate --docs` against
# this fixture. Used by the dev-environment live test in CI to cover the Linux
# docs-generate path that broke in the PR #438 incident. Production tarball
# runs (publish-cli.yml) leave this unset.
docs_fixture_dir="${DOCS_FIXTURE_DIR:-}"

export FERN_TOKEN="$token"

if [ "$test_tarball" = "true" ]; then
    echo "Testing published tarball (production-like environment)..."
    
    cli_dir="$(dirname "$cli_path")"
    
    echo "Creating tarball from $cli_dir..."
    cd "$cli_dir"
    tarball_path="$(pnpm pack 2>&1 | tail -n 1)"
    echo "Created tarball: $tarball_path"
    
    install_dir="$(mktemp -d)"
    echo "Installing tarball to $install_dir..."
    cd "$install_dir"
    npm install "$cli_dir/$tarball_path" --no-save
    
    cli_path="$install_dir/node_modules/.bin/fern"
    echo "Using installed CLI at: $cli_path"
fi

test_dir="$(mktemp -d)"
cd "$test_dir"

echo "Running Fern Commands in $test_dir!"
set -x

node "$cli_path" init --organization fern --fern-definition

node "$cli_path" add fern-java-sdk
node "$cli_path" add fern-python-sdk
# Place fern-typescript-sdk in its own `ts-sdk` group so we can exercise the
# `fern generate --group <name>` code path below. `fern generate --group ts-sdk`
# silently broke twice on prod in the PR #438 incident with zero pre-existing
# coverage.
node "$cli_path" add fern-typescript-sdk --group ts-sdk

echo "Testing fern upgrade command..."
node "$cli_path" upgrade --yes --log-level debug

node "$cli_path" generate --log-level debug
node "$cli_path" generate --group ts-sdk --log-level debug

set +x

node "$cli_path" register --log-level debug

# Verify `fern token` succeeds and prints a generated token. This command had
# zero coverage before FER-10553 and was one of the three commands broken by
# the PR #438 incident.
#
# The CLI prints the raw token value, so capture stdout to a file and only echo
# a sanitised version on failure — never write the unredacted output to CI logs.
echo "Testing fern token..."
token_output_file="$(mktemp)"
token_status=0
node "$cli_path" token > "$token_output_file" 2>&1 || token_status=$?

# Redact the token value before any echo of captured output. Logger format:
#   "Generated a FERN_TOKEN for <org>: <token>"
redact_token_output() {
    sed -E 's/(Generated a FERN_TOKEN for [^:]+:)[[:space:]]*[^[:space:]]+/\1 <redacted>/' "$token_output_file"
}

if [ "$token_status" -ne 0 ]; then
    echo "fern token failed with exit code $token_status. Sanitised output:"
    redact_token_output
    rm -f "$token_output_file"
    exit "$token_status"
fi
if ! grep -q "Generated a FERN_TOKEN" "$token_output_file"; then
    echo "fern token did not produce expected output. Sanitised output:"
    redact_token_output
    rm -f "$token_output_file"
    exit 1
fi
rm -f "$token_output_file"
echo "fern token succeeded"

# Optional: also exercise `fern generate --docs` against the supplied docs
# fixture. Enabled by the dev-env CI job (DOCS_FIXTURE_DIR points at the
# `windows/` fixture). The production tarball test skips this — it has no
# docs fixture pinned to a dev URL.
if [ -n "$docs_fixture_dir" ]; then
    echo "Testing fern generate --docs against $docs_fixture_dir..."
    set -x
    cd "$docs_fixture_dir"
    node "$cli_path" generate --docs --log-level debug
    set +x
    cd "$test_dir"
fi

echo "All commands completed successfully!"

rm -rf "$test_dir"
if [ "$test_tarball" = "true" ] && [ -n "$install_dir" ]; then
    rm -rf "$install_dir"
fi
