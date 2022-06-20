FROM eclipse-temurin:11-jre-alpine

ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION
COPY cli-$BUILD_VERSION.tar init.sh gradle-resources.zip /
RUN mkdir -m777 cli
RUN mv cli-$BUILD_VERSION.tar cli/cli.tar \
    && unzip gradle-resources.zip -d /gradle-resources \
    && rm -rf gradle-resources.zip \
    && chmod -R 777 /gradle-resources

ENTRYPOINT ["bin/sh", "init.sh"]