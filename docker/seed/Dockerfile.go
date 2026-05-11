# Stage 1: Pull wiremock image as tar (no daemon needed)
FROM alpine:3.23 AS wiremock-pull
RUN apk add --no-cache curl && \
    ARCH=$(uname -m) && if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -sL "https://github.com/google/go-containerregistry/releases/download/v0.21.2/go-containerregistry_Linux_${ARCH}.tar.gz" | tar xz -C /usr/local/bin crane && \
    crane pull wiremock/wiremock:3.9.1 /wiremock.tar

# Stage 2: Download a newer containerd build to address CVEs in the Go-module
# deps baked into docker:29.4.1-dind-alpine3.23 (which ships containerd v2.2.3).
#
# containerd v2.3.0 bumps grpc v1.78.0 -> v1.80.0, otel v1.38.0 -> v1.43.0,
# otel/sdk v1.38.0 -> v1.43.0, go-jose v4.1.3 -> v4.1.4 in the /usr/local/bin
# containerd / ctr / containerd-shim-runc-v2 binaries. The dockerd binary in
# 29.4.1 talks to containerd over the stable gRPC plugin protocol so newer
# minor versions of containerd are wire-compatible.
#
# We use the `containerd-static-*` archive (statically linked) because the
# default release tarball is dynamically linked against glibc and won't run
# on Alpine's musl libc.
#
# We deliberately do NOT overlay runc here: the upstream runc v1.4.2 release
# was built with go1.25.8, which has unfixed stdlib CVEs (CVE-2026-27143 et
# al.), while the runc v1.3.5 already shipped in the base image was built
# with the patched go1.26.2 toolchain. Bumping runc would trade two
# golang.org/x/net findings for several Critical/High stdlib findings, which
# is a regression.
FROM alpine:3.23 AS overlay-binaries
ARG CONTAINERD_VERSION=2.3.0
RUN apk add --no-cache curl tar && \
    ARCH=$(uname -m) && \
    case "$ARCH" in \
      x86_64) GOARCH=amd64 ;; \
      aarch64) GOARCH=arm64 ;; \
      *) echo "Unsupported arch: $ARCH"; exit 1 ;; \
    esac && \
    mkdir -p /overlay/usr/local/bin && \
    curl -fsSL "https://github.com/containerd/containerd/releases/download/v${CONTAINERD_VERSION}/containerd-static-${CONTAINERD_VERSION}-linux-${GOARCH}.tar.gz" \
      | tar -xz -C /overlay/usr/local --no-same-owner \
        bin/containerd bin/containerd-shim-runc-v2 bin/ctr

# Stage 3: Build the seed image
FROM docker:29.4.1-dind-alpine3.23

# Overlay newer containerd binaries (see overlay-binaries stage above).
COPY --from=overlay-binaries /overlay/ /

# Copy pre-pulled wiremock image
COPY --from=wiremock-pull /wiremock.tar /wiremock.tar

# Apply the latest APK security patches available for the base image
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

# Install golangci-lint
ENV GOLANGCI_LINT_VERSION=v2.12.2
RUN wget -O- -nv https://golangci-lint.run/install.sh | sh -s -- -b /usr/local/bin ${GOLANGCI_LINT_VERSION}

# Create entrypoint script to start dockerd and wait until it is ready
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'dockerd &' >> /entrypoint.sh && \
    echo 'for i in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 0.1; done' >> /entrypoint.sh && \
    echo 'if [ -f /wiremock.tar ]; then docker load < /wiremock.tar && rm -f /wiremock.tar; fi' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]
