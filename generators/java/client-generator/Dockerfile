# Apple Silicon: FROM bitnami/gradle:latest
FROM bitnami/gradle:latest

ARG BUILD_VERSION
ENV VERSION=$BUILD_VERSION
COPY client-generator-$BUILD_VERSION.tar init.sh /
RUN cd / \
    && mkdir -m777 /client-generator  \
    && mv /client-generator-$BUILD_VERSION.tar /client-generator/client-generator.tar \
    && cd client-generator \
    && tar -xvf client-generator.tar \
    && rm -rf client-generator.tar

ENTRYPOINT ["sh", "/init.sh"]