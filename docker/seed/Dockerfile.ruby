FROM docker:28.4.0-dind-alpine3.22

# Install Ruby and dependencies
RUN apk add --no-cache \
    ruby \
    ruby-dev \
    ruby-bundler \
    build-base \
    git \
    bash \
    docker-cli-compose

# Create entrypoint script to start dockerd and execute commands
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'dockerd &' >> /entrypoint.sh && \
    echo 'sleep 3' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]
