# Apple Silicon: FROM bitnami/gradle:latest
FROM bitnami/gradle:latest

ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION
COPY spring-server-generator-$BUILD_VERSION.tar init.sh /
RUN cd / \
    && mkdir -m777 /spring-server-generator  \
    && mv /spring-server-generator-$BUILD_VERSION.tar /spring-server-generator/spring-server-generator.tar \
    && cd spring-server-generator \
    && tar -xvf spring-server-generator.tar \
    && rm -rf spring-server-generator.tar

ENTRYPOINT ["sh", "/init.sh"]