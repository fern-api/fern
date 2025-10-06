FROM docker:28.4.0-dind-alpine3.22

# Install Go
ENV GO_VERSION=1.23.8
RUN apk add --no-cache wget tar \
    && wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz \
    && rm go${GO_VERSION}.linux-amd64.tar.gz \
    && apk del wget tar

ENV PATH="/usr/local/go/bin:${PATH}" \
    GOPATH="/go" \
    CGO_ENABLED=0

RUN mkdir -p "${GOPATH}/src" "${GOPATH}/bin"

# Create entrypoint script to start dockerd and execute commands
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'dockerd &' >> /entrypoint.sh && \
    echo 'sleep 3' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]