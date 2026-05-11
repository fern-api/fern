# Stage 1: Pull wiremock image as tar (no daemon needed)
FROM alpine:3.23 AS wiremock-pull
RUN apk add --no-cache curl && \
    ARCH=$(uname -m) && if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -sL "https://github.com/google/go-containerregistry/releases/download/v0.21.2/go-containerregistry_Linux_${ARCH}.tar.gz" | tar xz -C /usr/local/bin crane && \
    crane pull wiremock/wiremock:3.9.1 /wiremock.tar

# Stage 2: Build containerd v2.3.0 + runc v1.3.5 from source with go1.26.3 and
# golang.org/x/net v0.53.0 to clear stdlib + x/net CVEs the upstream prebuilts
# (still go1.26.2 / x/net <0.53) carry, and pick up the grpc / otel / go-jose
# bumps in containerd v2.3.0.
FROM golang:1.26.3-alpine3.23 AS overlay-binaries
ARG CONTAINERD_VERSION=2.3.0
ARG RUNC_VERSION=1.3.5
ARG XNET_VERSION=0.53.0
RUN apk add --no-cache git make gcc musl-dev linux-headers libseccomp-dev libseccomp-static bash ca-certificates && \
    mkdir -p /overlay/usr/local/bin
RUN git clone --depth 1 --branch v${CONTAINERD_VERSION} https://github.com/containerd/containerd.git /src/containerd && \
    cd /src/containerd && \
    go get golang.org/x/net@v${XNET_VERSION} && \
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

# Stage 3: Build the seed image
FROM docker:29.4.1-dind-alpine3.23

# Apply latest APK security patches
RUN apk update && apk upgrade --no-cache --available

# Overlay rebuilt containerd + runc binaries (see stage 2).
COPY --from=overlay-binaries /overlay/ /

# Drop unused buildx CLI plugin that ships vulnerable embedded Go modules.
# Keep docker-compose: wire-test bootstraps in generators/php/sdk run
# `docker compose -f …` to start WireMock alongside generated SDK tests.
RUN rm -f /usr/local/libexec/docker/cli-plugins/docker-buildx

# Copy pre-pulled wiremock image
COPY --from=wiremock-pull /wiremock.tar /wiremock.tar

# Install PHP, Composer, and required extensions. alpine 3.23's composer pulls
# in php84 (forward-compatible with generated SDK templates requiring php: ^8.1).
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
