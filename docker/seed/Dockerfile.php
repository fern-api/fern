FROM docker:28.4.0-dind-alpine3.22

# Install PHP, Composer, and required extensions
RUN apk add --no-cache \
    php83 \
    php83-phar \
    php83-mbstring \
    php83-openssl \
    php83-curl \
    php83-json \
    php83-dom \
    php83-xml \
    php83-xmlwriter \
    php83-tokenizer \
    php83-ctype \
    php83-iconv \
    php83-simplexml \
    php83-fileinfo \
    composer \
    bash \
    git

# Create symlink for php command
RUN ln -sf /usr/bin/php83 /usr/bin/php

# Create entrypoint script to start dockerd and wait until it is ready
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'dockerd &' >> /entrypoint.sh && \
    echo 'for i in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 0.1; done' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]
