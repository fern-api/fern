#!/usr/bin/env bash
# Lints biome-plugins/fixtures/shared-helpers.fixture.txt with the shared-helper plugins and fails if the
# reported lines differ from the lines marked `// violation`. This keeps a plugin from silently
# going quiet after a Biome upgrade or a pattern edit.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

cp "$root/biome-plugins/fixtures/shared-helpers.fixture.txt" "$workdir/fixture.ts"
cat > "$workdir/biome.jsonc" <<JSON
{
    "root": true,
    "linter": { "enabled": true, "rules": { "recommended": false } },
    "plugins": [
        "$root/biome-plugins/no-inline-is-record.grit",
        "$root/biome-plugins/no-inline-strip-trailing-slashes.grit",
        "$root/biome-plugins/no-inline-to-posix-path.grit",
        "$root/biome-plugins/no-inline-capitalize.grit"
    ]
}
JSON

expected="$(grep -n '// violation$' "$workdir/fixture.ts" | cut -d: -f1 | sort -n)"
reported="$(cd "$workdir" && "$root/node_modules/.bin/biome" lint --config-path="$workdir" --max-diagnostics=200 fixture.ts 2>&1 \
    | grep -E '^fixture\.ts:[0-9]+:[0-9]+ plugin' | cut -d: -f2 | sort -n | uniq || true)"

if [ "$expected" != "$reported" ]; then
    echo "Biome plugin fixture mismatch."
    echo "Expected violation lines: $(echo $expected)"
    echo "Reported violation lines: $(echo $reported)"
    exit 1
fi
echo "Biome plugin fixture OK ($(echo "$expected" | wc -l | tr -d ' ') violations)."
