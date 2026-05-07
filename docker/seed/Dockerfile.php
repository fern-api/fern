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
FROM alpine:3.23 AS overlay-containerd
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

# Stage 3: Rebuild docker-compose v5.1.2 from source with the patched go1.26.2
# toolchain and otel v1.43.0 to clear stdlib CVEs (CVE-2026-27143 et al.) and
# OpenTelemetry advisories (GHSA-hfvc-g4fc-pqhx, GHSA-w8rr-5gcm-pp58) baked
# into the docker-compose binary shipped in the base image.
#
# Upstream docker-compose v5.1.2 is built with go1.25.8 and pins otel v1.42.0,
# both of which are flagged by grype. We pull the upstream source at the
# v5.1.2 tag, bump the otel module graph to v1.43.0 via `go get`, run
# `go mod tidy`, and produce a static (CGO_ENABLED=0) binary using golang
# 1.26.x. The compose CLI surface is unchanged.
FROM golang:1.26-alpine AS build-compose
ARG COMPOSE_VERSION=5.1.2
ARG OTEL_VERSION=1.43.0
RUN apk add --no-cache curl git
WORKDIR /src
RUN curl -fsSL "https://github.com/docker/compose/archive/refs/tags/v${COMPOSE_VERSION}.tar.gz" \
    | tar -xz --strip-components=1
RUN go get \
        go.opentelemetry.io/otel@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/metric@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/sdk@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/sdk/metric@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/trace@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/exporters/otlp/otlptrace@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc@v${OTEL_VERSION} \
        go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp@v${OTEL_VERSION} && \
    go mod tidy
RUN CGO_ENABLED=0 go build -trimpath \
        -ldflags "-s -w -X github.com/docker/compose/v5/internal.Version=v${COMPOSE_VERSION}" \
        -o /out/docker-compose ./cmd

# Stage 4: Rebuild runc v1.4.2 from source with the patched go1.26.2 toolchain
# to clear stdlib CVEs and pick up runc's golang.org/x/net v0.43.0 (vs. the
# v0.35.0 in the base image's runc v1.3.5, which trips GHSA-vvgc-356p-c3xw
# and GHSA-qxp5-gwg8-xv66).
#
# The upstream runc v1.4.2 release binary is built with go1.25.8 (regressed
# stdlib CVEs); rebuilding from source with the golang:1.26 toolchain gives
# us the new x/net plus the patched stdlib in a single hop. runc's `static`
# Make target produces a static-pie binary that runs on Alpine's musl libc.
FROM golang:1.26 AS build-runc
ARG RUNC_VERSION=1.4.2
RUN apt-get update && \
    apt-get install -y --no-install-recommends libseccomp-dev pkg-config make && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN curl -fsSL "https://github.com/opencontainers/runc/archive/refs/tags/v${RUNC_VERSION}.tar.gz" \
    | tar -xz --strip-components=1
RUN make static GO=go EXTRA_LDFLAGS='-s -w' && \
    install -D -m 0755 runc /out/usr/local/bin/runc

# Stage 5: Build the seed image
FROM docker:29.4.1-dind-alpine3.23

# Apply latest security patches to base image packages (libssl3, libcrypto3, libcurl, etc.)
RUN apk upgrade --no-cache

# Overlay newer containerd binaries (see overlay-containerd stage above).
COPY --from=overlay-containerd /overlay/ /

# Overlay docker-compose rebuilt with go1.26.2 + otel v1.43.0 (see
# build-compose stage above). The base image installs the plugin under
# /usr/local/libexec/docker/cli-plugins so we replace it there too.
COPY --from=build-compose /out/docker-compose /usr/local/bin/docker-compose
COPY --from=build-compose /out/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose

# Overlay runc rebuilt with go1.26.2 (see build-runc stage above). The base
# image ships runc at /usr/local/bin/runc, so we replace it in place.
COPY --from=build-runc /out/usr/local/bin/runc /usr/local/bin/runc

# Drop docker-buildx: it is shipped as a CLI plugin in the base image and
# is built with go1.25.8 + otel v1.40.0 + sigstore/timestamp-authority
# v2.0.3 + moby/spdystream v0.5.0 (all flagged by grype). The php-seed wire
# tests use `docker compose` and `docker run` only, so removing the buildx
# plugin is safe and eliminates 6 fixable CVEs.
RUN rm -f /usr/local/libexec/docker/cli-plugins/docker-buildx

# Copy pre-pulled wiremock image
COPY --from=wiremock-pull /wiremock.tar /wiremock.tar

# Install PHP, Composer, and required extensions
# alpine 3.23's composer package depends on php84, so php84 is the runtime here.
# This is forward-compatible with the generated SDK templates (which require php: ^8.1).
RUN apk add --no-cache \
    php84 \
    php84-phar \
    php84-mbstring \
    php84-openssl \
    php84-curl \
    php84-dom \
    php84-xml \
    php84-xmlwriter \
    php84-tokenizer \
    php84-ctype \
    php84-iconv \
    php84-simplexml \
    php84-fileinfo \
    composer \
    bash \
    git

# Create symlink for php command
RUN ln -sf /usr/bin/php84 /usr/bin/php

# Create entrypoint script to start dockerd and wait until it is ready
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'dockerd &' >> /entrypoint.sh && \
    echo 'for i in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 0.1; done' >> /entrypoint.sh && \
    echo 'if [ -f /wiremock.tar ]; then docker load < /wiremock.tar && rm -f /wiremock.tar; fi' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]
