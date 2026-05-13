# Stage 1: Pull wiremock image as tar (no daemon needed)
FROM alpine:3.23 AS wiremock-pull
RUN apk add --no-cache curl && \
    ARCH=$(uname -m) && if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -sL "https://github.com/google/go-containerregistry/releases/download/v0.21.2/go-containerregistry_Linux_${ARCH}.tar.gz" | tar xz -C /usr/local/bin crane && \
    crane pull wiremock/wiremock:3.9.1 /wiremock.tar

# Stage 2: Rebuild containerd v2.3.0 + runc v1.3.5 + moby (dockerd, docker-proxy)
# + docker CLI from source with go1.26.3 and golang.org/x/net v0.53.0.
# Upstream `docker:29.4.3-dind-alpine3.23` ships dockerd / docker / docker-proxy
# built with go1.26.2, which grype flags for the unpatched go/stdlib 1.26.2
# CVEs (CVE-2026-33811, CVE-2026-33814, CVE-2026-39820, CVE-2026-39836,
# CVE-2026-42499). Rebuilding under GOTOOLCHAIN=go1.26.3 swaps the embedded
# stdlib without changing functionality. The containerd/runc rebuild also
# picks up the grpc / otel / go-jose bumps from the v2.3.0 release line.
FROM golang:1.26.3-alpine3.23 AS overlay-binaries
ARG CONTAINERD_VERSION=2.3.0
ARG RUNC_VERSION=1.3.5
# Bumped from docker-v29.4.3 (which maps to moby module pseudo-version
# v2.0.0-20260506155126-56be73107b38) to docker-v29.5.0-rc.1 (== moby module
# tag v2.0.0-beta.12). v2.0.0-beta.8 is the upstream-fix version for
# CVE-2026-33997 and CVE-2026-34040 (github.com/moby/moby/v2), so bumping
# past beta.8 clears both findings from the rebuilt dockerd / docker-proxy
# binaries we overlay onto docker:29.4.3-dind-alpine3.23.
ARG MOBY_VERSION=29.5.0-rc.1
ARG DOCKER_CLI_VERSION=29.5.0-rc.1
ARG XNET_VERSION=0.53.0
ARG OTEL_SDK_VERSION=1.43.0
ENV GOTOOLCHAIN=go1.26.3
RUN apk add --no-cache git make gcc musl-dev linux-headers libseccomp-dev libseccomp-static bash ca-certificates && \
    mkdir -p /overlay/usr/local/bin
RUN git clone --depth 1 --branch v${CONTAINERD_VERSION} https://github.com/containerd/containerd.git /src/containerd && \
    cd /src/containerd && \
    go get golang.org/x/net@v${XNET_VERSION} \
           go.opentelemetry.io/otel/sdk@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/trace@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/metric@v${OTEL_SDK_VERSION} && \
    go mod tidy && \
    go mod vendor && \
    for cmd in containerd ctr containerd-shim-runc-v2; do \
      CGO_ENABLED=0 go build -tags "osusergo netgo static_build" -trimpath -ldflags "-s -w" \
        -o /overlay/usr/local/bin/$cmd ./cmd/$cmd ; \
    done
RUN git clone --depth 1 --branch v${RUNC_VERSION} https://github.com/opencontainers/runc.git /src/runc && \
    cd /src/runc && \
    go get golang.org/x/net@v${XNET_VERSION} && \
    go mod tidy && \
    go mod vendor && \
    make static EXTRA_LDFLAGS="-s -w" && \
    cp runc /overlay/usr/local/bin/runc
RUN git clone --depth 1 --branch docker-v${MOBY_VERSION} https://github.com/moby/moby.git /src/moby && \
    cd /src/moby && \
    # Force the patched golang.org/x/net (HTTP/2 server header smuggling,
    # CVE-2026-33814) and patched otel/sdk (CVE-2026-39883 PATH hijacking
    # on BSD/Solaris) before vendoring + building dockerd/docker-proxy.
    go get golang.org/x/net@v${XNET_VERSION} \
           go.opentelemetry.io/otel/sdk@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/trace@v${OTEL_SDK_VERSION} \
           go.opentelemetry.io/otel/metric@v${OTEL_SDK_VERSION} && \
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
    go get golang.org/x/net@v${XNET_VERSION} && \
    go mod tidy && \
    go mod vendor && \
    CGO_ENABLED=0 go build -mod=vendor \
      -tags "osusergo netgo static_build pkcs11" \
      -trimpath -ldflags "-s -w" \
      -o /overlay/usr/local/bin/docker ./cmd/docker

# Stage 3: Build the seed image
FROM docker:29.4.3-dind-alpine3.23

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

ENV PATH="/usr/local/go/bin:${PATH}" \
    GOPATH="/go" \
    CGO_ENABLED=0

RUN mkdir -p "${GOPATH}/src" "${GOPATH}/bin"

# Install golangci-lint via `go install` so the binary embeds the just-installed
# go1.26.3 stdlib instead of the older toolchain used by the upstream prebuilt.
ENV GOLANGCI_LINT_VERSION=v2.12.2
RUN GOBIN=/usr/local/bin CGO_ENABLED=0 go install -ldflags "-s -w" \
      github.com/golangci/golangci-lint/v2/cmd/golangci-lint@${GOLANGCI_LINT_VERSION} && \
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
