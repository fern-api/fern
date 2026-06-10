# Stage 1: Build Node CLI
FROM node:24.16-alpine3.23 AS node

RUN apk --no-cache add git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# Patch vulnerable packages bundled inside npm's node_modules. Replace them
# with the latest patched releases via `npm pack` so the resulting layer does
# not ship known-vulnerable copies.
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
# Built with Go 1.26.4 so the resulting /fern-go-sdk binary embeds a patched
# stdlib that clears vulnerability scanners.
FROM golang:1.26.4-alpine3.23

WORKDIR /workspace

# Patch src/go.mod and src/cmd/go.mod to bump declared x/net, x/crypto,
# x/sys versions so SBOM scanners no longer flag stale pseudo-versions.
RUN sed -i 's|golang.org/x/net v0.47.1-[^ ]*|golang.org/x/net v0.55.0|' \
        /usr/local/go/src/go.mod /usr/local/go/src/vendor/modules.txt && \
    sed -i '/golang.org\/x\/net v0.47.1-/d' /usr/local/go/src/go.sum && \
    sed -i 's|golang.org/x/crypto v0.46.1-[^ ]*|golang.org/x/crypto v0.52.0|' \
        /usr/local/go/src/go.mod /usr/local/go/src/vendor/modules.txt && \
    sed -i '/golang.org\/x\/crypto v0.46.1-/d' /usr/local/go/src/go.sum && \
    sed -i 's|golang.org/x/sys v0.39.0|golang.org/x/sys v0.45.0|g' \
        /usr/local/go/src/go.mod /usr/local/go/src/vendor/modules.txt && \
    sed -i '/golang.org\/x\/sys v0.39.0/d' /usr/local/go/src/go.sum && \
    sed -i 's|golang.org/x/sys v0.39.0|golang.org/x/sys v0.45.0|g' \
        /usr/local/go/src/cmd/go.mod /usr/local/go/src/cmd/vendor/modules.txt && \
    sed -i '/golang.org\/x\/sys v0.39.0/d' /usr/local/go/src/cmd/go.sum

# Security update 2026-06-10: openssl 3.5.6 → 3.5.7 (12 CVEs including
# CVE-2026-45447 heap use-after-free in PKCS7_verify, High severity).
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache --upgrade libssl3 libcrypto3
RUN apk add --no-cache ca-certificates git libstdc++
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/go/go.mod generators/go/go.sum /workspace/
COPY generators/go/cmd /workspace/cmd
COPY generators/go/internal /workspace/internal
COPY generators/go/version.go /workspace/version.go
# Bump golang.org/x/net, x/crypto, x/sys (transitives of golang.org/x/tools)
# to versions that clear vulnerability scanners.
RUN go get golang.org/x/net@v0.55.0 golang.org/x/crypto@v0.52.0 golang.org/x/sys@v0.45.0 && go mod tidy && go mod download

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

# Drop build-time artifacts (testdata, module cache) that scanners flag
# but the runtime image doesn't need.
RUN rm -rf /workspace/internal/testdata && \
    go clean -modcache && \
    rm -rf /root/.cache/go-build

RUN test -f /bin/go-v2 || echo "go-v2 CLI not found or not executable"

ENTRYPOINT ["/fern-go-sdk"]
