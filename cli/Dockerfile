FROM eclipse-temurin:11-jre-alpine

ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION
COPY cli-$BUILD_VERSION.tar init.sh /
RUN mkdir -m777 cli
RUN mv cli-$BUILD_VERSION.tar cli/cli.tar

ENTRYPOINT ["bin/sh", "init.sh"]
