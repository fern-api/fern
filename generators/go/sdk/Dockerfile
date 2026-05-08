# Stage 1: Build Node CLI
FROM node:22.22-alpine3.23 AS node

RUN apk --no-cache add git zip
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

# Patch vulnerable packages bundled inside npm's node_modules that lag behind
# upstream advisories (ip-address GHSA-v2v4-37r5-5v8g, brace-expansion
# GHSA-f886-m6hf-6m8v, picomatch GHSA-3v7f-55p6-f55p / GHSA-c2c7-rcm5-vvqj).
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
    cd / && rm -rf /tmp/pkg-fix /root/.npm

COPY generators/go-v2/sdk/dist/ /dist/

# Stage 2: Final Go image
FROM golang:1.26.2-alpine3.23

WORKDIR /workspace

RUN apk update && apk upgrade --no-cache
RUN apk add --no-cache ca-certificates git libstdc++
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

COPY generators/go/go.mod generators/go/go.sum /workspace/
RUN go mod download

COPY generators/go/cmd /workspace/cmd
COPY generators/go/internal /workspace/internal
COPY generators/go/version.go /workspace/version.go

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

RUN test -f /bin/go-v2 || echo "go-v2 CLI not found or not executable"

ENTRYPOINT ["/fern-go-sdk"]
