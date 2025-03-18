# Stage 1: Java V2

FROM node:20.18-alpine3.20 AS node
RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"
COPY generators/go-v2/sdk/dist/cli.cjs /dist/cli.cjs

COPY generators/java-v2/sdk/features.yml /assets/features.yml

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Copy Node CLI from first stage and rename it /bin/java-v2
COPY --from=node /dist/cli.cjs /bin/java-v2
RUN chmod +x /bin/java-v2

RUN test -f /bin/java-v2 || echo "java-v2 CLI not found or not executable"

# Stage 2: Java V1

# Apple Silicon: FROM bitnami/gradle:latest
FROM gradle:jdk11-jammy

COPY build/distributions/sdk.tar init.sh /
RUN cd / \
    && tar -xvf sdk.tar \
    && rm -rf sdk.tar

ENV JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF8"

ENTRYPOINT ["sh", "/init.sh"]