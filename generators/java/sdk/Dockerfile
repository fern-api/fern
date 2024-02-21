# Apple Silicon: FROM bitnami/gradle:latest
FROM bitnami/gradle:latest

COPY build/distributions/sdk.tar init.sh /
RUN cd / \
    && tar -xvf sdk.tar \
    && rm -rf sdk.tar

ENTRYPOINT ["sh", "/init.sh"]