FROM eclipse-temurin:11-jre-alpine

ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION
COPY fern-client-cli-$BUILD_VERSION.tar init.sh /
RUN mv fern-client-cli-$BUILD_VERSION.tar fern-client-cli.tar

ENTRYPOINT ["bin/sh", "init.sh"]

