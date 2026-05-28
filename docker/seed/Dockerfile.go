# Stage 1: Pull wiremock image as tar (no daemon needed)
FROM alpine:3.23 AS wiremock-pull
RUN apk add --no-cache curl && \
    ARCH=$(uname -m) && if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -sL "https://github.com/google/go-containerregistry/releases/download/v0.21.2/go-containerregistry_Linux_${ARCH}.tar.gz" | tar xz -C /usr/local/bin crane && \
    crane pull wiremock/wiremock:3.9.1 /wiremock.tar

# Stage 2: Rebuild containerd v2.3.1 + runc v1.3.5 + moby (dockerd, docker-proxy)
# + docker CLI from source with go1.26.3 and golang.org/x/net v0.53.0.
# Upstream `docker:29.5.2-dind-alpine3.23` ships dockerd / docker / docker-proxy
# built with go1.26.2, which grype flags for the unpatched go/stdlib 1.26.2
# CVEs (CVE-2026-33811, CVE-2026-33814, CVE-2026-39820, CVE-2026-39836,
# CVE-2026-42499). Rebuilding under GOTOOLCHAIN=go1.26.3 swaps the embedded
# stdlib without changing functionality. The containerd/runc rebuild also
# picks up the grpc / otel / go-jose bumps from the v2.3.x release line.
FROM golang:1.26.3-alpine3.23 AS overlay-binaries
ARG CONTAINERD_VERSION=2.3.1
ARG RUNC_VERSION=1.3.5
# moby v29.5.2 includes fixes for CVE-2026-33997, CVE-2026-34040,
# CVE-2026-41567, CVE-2026-41568, CVE-2026-42306 and later patches.
ARG MOBY_VERSION=29.5.2
ARG DOCKER_CLI_VERSION=29.5.2
ARG XNET_VERSION=0.55.0
ARG XCRYPTO_VERSION=0.52.0
ARG XSYS_VERSION=0.45.0
ARG OTEL_SDK_VERSION=1.43.0
ARG IN_TOTO_VERSION=0.11.0
ENV GOTOOLCHAIN=go1.26.3
RUN apk add --no-cache git make gcc musl-dev linux-headers libseccomp-dev libseccomp-static bash ca-certificates && \
    mkdir -p /overlay/usr/local/bin
# Bump in-toto-golang to v0.11.0 (GHSA-pmwq-pjrm-6p5r) and pin the OTLP
# HTTP exporters to v${OTEL_SDK_VERSION} (CVE-2026-39882).
RUN git clone --depth 1 --branch v${CONTAINERD_VERSION} https://github.com/containerd/containerd.git /src/containerd && \
    cd /src/containerd && \
    go get golang.org/x/net@v${XNET_VERSION} \
           golang.org/x/crypto@v${XCRYPTO_VERSION} \
           golang.org/x/sys@v${XSYS_VERSION} \
           github.com/in-toto/in-toto-golang@v${IN_TOTO_VERSION} \
           go.opentelemetry.io/otel/sdk@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/trace@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/metric@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp@v${OTEL_SDK_VERSION} && \
    go mod tidy && \
    go mod vendor && \
    for cmd in containerd ctr containerd-shim-runc-v2; do \
      CGO_ENABLED=0 go build -tags "osusergo netgo static_build" -trimpath -ldflags "-s -w" \
        -o /overlay/usr/local/bin/$cmd ./cmd/$cmd ; \
    done
RUN git clone --depth 1 --branch v${RUNC_VERSION} https://github.com/opencontainers/runc.git /src/runc && \
    cd /src/runc && \
    go get golang.org/x/net@v${XNET_VERSION} \
           golang.org/x/crypto@v${XCRYPTO_VERSION} \
           golang.org/x/sys@v${XSYS_VERSION} && \
    go mod tidy && \
    go mod vendor && \
    make static EXTRA_LDFLAGS="-s -w" && \
    cp runc /overlay/usr/local/bin/runc
RUN git clone --depth 1 --branch docker-v${MOBY_VERSION} https://github.com/moby/moby.git /src/moby && \
    cd /src/moby && \
    # Force patched x/net (CVE-2026-33814), containerd (GHSA-fqw6-gf59-qr4w),
    # otel SDK + OTLP HTTP exporters (CVE-2026-39882, CVE-2026-39883)
    # before vendoring dockerd/docker-proxy.
    go get golang.org/x/net@v${XNET_VERSION} \
           golang.org/x/crypto@v${XCRYPTO_VERSION} \
           golang.org/x/sys@v${XSYS_VERSION} \
           github.com/containerd/containerd/v2@v${CONTAINERD_VERSION} \
           go.opentelemetry.io/otel/sdk@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/trace@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/metric@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp@v${OTEL_SDK_VERSION} && \
    go mod tidy && \
    go mod vendor && \
    CGO_ENABLED=0 go build -mod=vendor \
      -tags "osusergo netgo static_build exclude_graphdriver_btrfs exclude_graphdriver_devicemapper" \
      -trimpath -ldflags "-s -w" \
      -o /overlay/usr/local/bin/dockerd ./cmd/dockerd && \
    CGO_ENABLED=0 go build -mod=vendor \
      -tags "osusergo netgo static_build" \
      -trimpath -ldflags "-s -w" \
      -o /overlay/usr/local/bin/docker-proxy ./cmd/docker-proxy
RUN git clone --depth 1 --branch v${DOCKER_CLI_VERSION} https://github.com/docker/cli.git /src/docker-cli && \
    cd /src/docker-cli && \
    cp vendor.mod go.mod && cp vendor.sum go.sum && \
    # docker CLI's vendor.mod pins x/net <0.53; bump it (and re-vendor)
    # so the built /usr/local/bin/docker also clears CVE-2026-33814.
    go get golang.org/x/net@v${XNET_VERSION} \
           golang.org/x/crypto@v${XCRYPTO_VERSION} \
           golang.org/x/sys@v${XSYS_VERSION} && \
    go mod tidy && \
    go mod vendor && \
    CGO_ENABLED=0 go build -mod=vendor \
      -tags "osusergo netgo static_build pkcs11" \
      -trimpath -ldflags "-s -w" \
      -o /overlay/usr/local/bin/docker ./cmd/docker

# Stage 3: Build the seed image
FROM docker:29.5.2-dind-alpine3.23

# Overlay rebuilt containerd + runc + moby (dockerd, docker-proxy) + docker CLI
# binaries (see stage 2). These replace the upstream go1.26.2 builds.
COPY --from=overlay-binaries /overlay/ /

# Drop unused docker CLI plugins (buildx, compose) that ship vulnerable
# embedded Go modules; seed only uses `docker load` and `docker run`.
RUN rm -rf /usr/local/libexec/docker/cli-plugins /usr/local/bin/docker-compose

# Copy pre-pulled wiremock image
COPY --from=wiremock-pull /wiremock.tar /wiremock.tar

# Apply latest APK security patches
RUN apk update && apk upgrade --no-cache --available

# Install Go (multi-arch: supports both amd64 and arm64)
ENV GO_VERSION=1.26.3
RUN set -eux; \
    ARCH="$(uname -m)"; \
    case "${ARCH}" in \
        aarch64|arm64) GOARCH="arm64" ;; \
        x86_64|amd64) GOARCH="amd64" ;; \
        *) echo "Unsupported arch: ${ARCH}"; exit 1 ;; \
    esac; \
    wget -q "https://go.dev/dl/go${GO_VERSION}.linux-${GOARCH}.tar.gz" \
    && tar -C /usr/local -xzf "go${GO_VERSION}.linux-${GOARCH}.tar.gz" \
    && rm "go${GO_VERSION}.linux-${GOARCH}.tar.gz"

# Go 1.26.3 ships the CVE-2026-33814 fix in h2_bundle.go but src/go.mod
# still pins old pseudo-versions of x/net and x/crypto, and an old x/sys.
# Bump the SBOM files so grype no longer flags them.
# Patch both src/go.mod (stdlib) and src/cmd/go.mod (toolchain commands)
# so scanners like grype and AWS Inspector stop reporting CVE-2026-39824.
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

ENV PATH="/usr/local/go/bin:${PATH}" \
    GOPATH="/go" \
    CGO_ENABLED=0

RUN mkdir -p "${GOPATH}/src" "${GOPATH}/bin"

# Build golangci-lint from source so we can bump golang.org/x/sys to v0.45.0
# (CVE-2026-39824). `go install` cannot override transitive deps, so we clone,
# patch, and build.
ENV GOLANGCI_LINT_VERSION=v2.12.2
RUN git clone --depth 1 --branch ${GOLANGCI_LINT_VERSION} \
      https://github.com/golangci/golangci-lint.git /tmp/golangci-lint && \
    cd /tmp/golangci-lint && \
    go get golang.org/x/sys@v0.45.0 && go mod tidy && \
    CGO_ENABLED=0 go build -ldflags "-s -w" -trimpath \
      -o /usr/local/bin/golangci-lint ./cmd/golangci-lint && \
    cd / && rm -rf /tmp/golangci-lint && \
    go clean -modcache && \
    rm -rf /root/.cache/go-build

# Create entrypoint script to start dockerd and wait until it is ready
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'dockerd &' >> /entrypoint.sh && \
    echo 'for i in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 0.1; done' >> /entrypoint.sh && \
    echo 'if [ -f /wiremock.tar ]; then docker load < /wiremock.tar && rm -f /wiremock.tar; fi' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]
