#!/usr/bin/env sh

set -e

cli_path="$1"
token="$2"
test_tarball="${3:-false}"

export FERN_TOKEN="$token"

if [ "$test_tarball" = "true" ]; then
    echo "Testing published tarball (production-like environment)..."
    
    cli_dir="$(dirname "$cli_path")"
    
    echo "Creating tarball from $cli_dir..."
    cd "$cli_dir"
    tarball_path="$(npm pack 2>&1 | tail -n 1)"
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

node "$cli_path" init --organization fern

node "$cli_path" add fern-java-sdk
node "$cli_path" add fern-python-sdk
node "$cli_path" add fern-postman

cat > fern/generators.yml << 'EOF'
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-java-sdk
        version: 0.0.1
        output:
          location: local-file-system
          path: ../generated/java
      - name: fernapi/fern-python-sdk
        version: 0.0.1
        output:
          location: local-file-system
          path: ../generated/python
      - name: fernapi/fern-postman
        version: 0.0.1
        output:
          location: local-file-system
          path: ../generated/postman
EOF

echo "Testing fern upgrade command..."
node "$cli_path" upgrade --yes --log-level debug

node "$cli_path" generate --log-level debug

set +x

node "$cli_path" register --log-level debug

echo "All commands completed successfully!"

rm -rf "$test_dir"
if [ "$test_tarball" = "true" ] && [ -n "$install_dir" ]; then
    rm -rf "$install_dir"
fi
