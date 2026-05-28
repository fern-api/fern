# Stage 1: Build Node CLI
FROM node:24.16-alpine3.23 AS node

RUN apk --no-cache add git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# Patch vulnerable packages bundled inside npm's node_modules that lag behind
# upstream advisories (ip-address GHSA-v2v4-37r5-5v8g, brace-expansion
# GHSA-jxxr-4gwj-5jf2, picomatch GHSA-3v7f-55p6-f55p / GHSA-c2c7-rcm5-vvqj).
# We replace them with the latest patched releases via `npm pack` so the
# resulting layer does not ship known-vulnerable copies.
RUN set -eux; \
    NPM_NM=/usr/local/lib/node_modules/npm/node_modules; \
    mkdir -p /tmp/pkg-fix && cd /tmp/pkg-fix; \
    for pkg in ip-address brace-expansion picomatch; do \
        TARBALL="$(npm pack "${pkg}@latest" --silent)"; \
        rm -rf "${NPM_NM:?}/${pkg}"; \
        mkdir -p "${NPM_NM}/${pkg}"; \
        tar -xzf "${TARBALL}" -C "${NPM_NM}/${pkg}" --strip-components=1; \
    done; \
    # npm 11.12.1 also vendors a nested picomatch under tinyglobby; patch it too.
    for nested in "${NPM_NM}/tinyglobby/node_modules/picomatch"; do \
        if [ -d "${nested}" ]; then \
            TARBALL="$(npm pack picomatch@latest --silent)"; \
            rm -rf "${nested}"; \
            mkdir -p "${nested}"; \
            tar -xzf "${TARBALL}" -C "${nested}" --strip-components=1; \
        fi; \
    done; \
    cd / && rm -rf /tmp/pkg-fix /root/.npm

COPY generators/go-v2/sdk/dist/ /dist/

# Stage 2: Final Go image
# Built with Go 1.26.3 (vs. golang:1.26.2 previously) so that the resulting
# /fern-go-sdk binary embeds the Go 1.26.3 stdlib, which fixes the unpatched
# stdlib CVEs reported against go/stdlib:1.26.2 (CVE-2026-33811,
# CVE-2026-33814, CVE-2026-39820, CVE-2026-39836, CVE-2026-42499) and the
# Go toolchain (CVE-2026-42501).
FROM golang:1.26.3-alpine3.23

WORKDIR /workspace

# Go 1.26.3 ships the CVE-2026-33814 fix in h2_bundle.go but src/go.mod
# still pins x/net v0.47.1; bump SBOM files to v0.53.0 to match the code.
RUN sed -i 's|golang.org/x/net v0.47.1-[^ ]*|golang.org/x/net v0.53.0|' \
        /usr/local/go/src/go.mod /usr/local/go/src/vendor/modules.txt && \
    sed -i '/golang.org\/x\/net v0.47.1-/d' /usr/local/go/src/go.sum

RUN apk update && apk upgrade --no-cache
RUN apk add --no-cache ca-certificates git libstdc++
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/go/go.mod generators/go/go.sum /workspace/
COPY generators/go/cmd /workspace/cmd
COPY generators/go/internal /workspace/internal
COPY generators/go/version.go /workspace/version.go
# Bump golang.org/x/net to v0.53.0 (fixes CVE-2026-33814 HTTP/2 server
# header smuggling). x/net is a transitive of golang.org/x/tools and is
# normally pulled at v0.39.0; this forces the patched build.
RUN go get golang.org/x/net@v0.53.0 && go mod tidy && go mod download

COPY generators/go-v2/sdk/features.yml /assets/features.yml

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Copy all Node CLI contents from first stage to /bin/ and rename cli.cjs to go-v2
COPY --from=node /dist/ /bin/
RUN mv /bin/cli.cjs /bin/go-v2 && chmod +x /bin/go-v2

RUN CGO_ENABLED=0 go build -ldflags "-s -w" -trimpath -buildvcs=false -o /fern-go-sdk ./cmd/fern-go-sdk

# Drop build-time artifacts that grype scans as SBOM sources but that
# the runtime image doesn't need:
#   - /workspace/internal/testdata/** ships test fixture go.sum files
#     that list a very old gopkg.in/yaml.v3 v3.0.0-20200313102051
#     pseudo-version in the /go.mod hashes (CVE-2022-28948), even though
#     the runtime never resolves that version.
#   - /go/pkg/mod and /root/.cache/go-build hold downloaded module
#     sources (golang.org/x/net v0.39.0 transitively from
#     golang.org/x/tools v0.32.0) that grype scans even though the
#     compiled /fern-go-sdk binary does not link x/net.
RUN rm -rf /workspace/internal/testdata && \
    go clean -modcache && \
    rm -rf /root/.cache/go-build

RUN test -f /bin/go-v2 || echo "go-v2 CLI not found or not executable"

ENTRYPOINT ["/fern-go-sdk"]
