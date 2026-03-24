# Stage 1: Pull wiremock image as tar (no daemon needed)
FROM alpine:3.22 AS wiremock-pull
RUN apk add --no-cache curl && \
    ARCH=$(uname -m) && if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -sL "https://github.com/google/go-containerregistry/releases/download/v0.21.2/go-containerregistry_Linux_${ARCH}.tar.gz" | tar xz -C /usr/local/bin crane && \
    crane pull wiremock/wiremock:3.9.1 /wiremock.tar

# Stage 2: Build the seed image
FROM docker:28.4.0-dind-alpine3.22

# Copy pre-pulled wiremock image
COPY --from=wiremock-pull /wiremock.tar /wiremock.tar

# Install Go (multi-arch: supports both amd64 and arm64)
ENV GO_VERSION=1.23.8
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
ENV GOLANGCI_LINT_VERSION=v2.10.1
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
