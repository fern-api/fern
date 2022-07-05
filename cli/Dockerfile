FROM gradle:7.4.2-jdk11-alpine

ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION
COPY cli-$BUILD_VERSION.tar init.sh build.gradle /
RUN cd / \
    && mkdir -m777 /cli  \
    && mv /cli-$BUILD_VERSION.tar /cli/cli.tar \
    && cd cli \
    && tar -xvf cli.tar \
    && rm -rf cli.tar \
    && mkdir /gradle-cache-project \
    && mv /build.gradle /gradle-cache-project/build.gradle \
    && cd /gradle-cache-project \
    && gradle build --refresh-dependencies

ENTRYPOINT ["sh", "/init.sh"]