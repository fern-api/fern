# On-prem adapter: local generation quickstart

Running Postman's on-prem SDK adapter locally, on its `rc` images. Needs Fern CLI >= 5.123.0 and Docker.

## 1. Set the OAT

The `rc` images are private. Export the Docker Hub organization access token and the CLI logs in for you:

```bash
export DOCKERHUB_OAT=dckr_oat_...
```

Same variable name self-hosted Fern Docs uses, so an existing docs customer already has this set. Before each pull the CLI runs `docker login --username fernenterprise --password-stdin`, but only for images in the `fernenterprise` namespace — a workspace running Fern's public `fernapi` generators never sends the token anywhere, and neither does a pull from your own mirrored registry.

Leave it unset and nothing changes — whatever `docker` is already logged into is what pulls, so a manual `docker login` still works:

```bash
echo "$DOCKERHUB_OAT" | docker login --username fernenterprise --password-stdin
```

## 2. Point generators.yml at an adapter version

The adapter is published under Fern's generator names. The *version* is what selects it, at or above the language's cutover:

| generator | cutover |
|---|---|
| `fernapi/fern-typescript-sdk`, `fernapi/fern-typescript-node-sdk` | `4.0.0` |
| `fernapi/fern-python-sdk` | `6.0.0` |
| `fernapi/fern-java-sdk` | `5.0.0` |
| `fernapi/fern-go-sdk` | `2.0.0` |
| `fernapi/fern-csharp-sdk` | `3.0.0` |
| `fernapi/fern-php-sdk` | `3.0.0` |
| `fernapi/fern-ruby-sdk` | `2.0.0` |
| `fernapi/fern-rust-sdk`, `fernapi/fern-swift-sdk` | `1.0.0` |

```yaml
groups:
  onprem:
    generators:
      - name: fernapi/fern-python-sdk
        version: 6.0.0
```

`version: latest` is **not** the adapter — an unreadable version means Fern's own generator. Selecting the adapter is explicit.

## 3. Migrate your config

Adapter invocations are configured by `sdk-config.yml`, not `generators.yml`:

```bash
fern sdk migrate
```

Writes `fern/sdk-config.yml` and archives `generators.yml` as `generators.archived.yml`. Other generators keep running from `generators.yml`. Skip this and generation fails with a message telling you to run it.

## 4. Generate against the RC image

```bash
USE_FERN_RC=true fern generate --local --group onprem
```

`USE_FERN_RC=true` (or `1`) swaps the resolved image for `fernenterprise/fern-<language>-sdk:rc`, the moving newest pre-release tag. It only applies to invocations that already resolve to the adapter, so it's a no-op on Fern generators.

## Knobs

- `FERN_RC_NAMESPACE=acme-staging` — pull the `rc` from another namespace instead of `fernenterprise`. Only read when `USE_FERN_RC` is set. Pair it with `DOCKERHUB_OAT_USERNAME=acme-staging` so the login targets that org too.
- `FERN_GENERATOR_NETWORK=none` — run the container with no network access, as air-gapped customers do.
- Digest pin, in `generators.yml`: `name: fernapi/fern-python-sdk@sha256:<64 hex>`. Exact artifact, beats `USE_FERN_RC`; IR version resolution still keys off the name.

## Gotchas

- Adapter generates from the raw spec, so the workspace must be OpenAPI/AsyncAPI (OSS). Protobuf, OpenRPC and GraphQL specs are refused on the host.
- One primary spec only — a multi-spec workspace is refused rather than silently generating from the first.
- Local SDK generation only. Publishing, GitHub delivery and docs aren't translated yet.
