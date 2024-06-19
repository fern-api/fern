# Apple Silicon: FROM bitnami/gradle:latest
FROM gradle:jdk11-jammy

# Install node and npm.
ENV NODE_VERSION=18.20.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

COPY build/distributions/spring.tar init.sh /
RUN cd / \
    && tar -xvf spring.tar \
    && rm -rf spring.tar

ENTRYPOINT ["sh", "/init.sh"]