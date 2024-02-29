# Apple Silicon: FROM bitnami/gradle:latest
FROM gradle:jdk11-jammy

COPY build/distributions/sdk.tar init.sh /
RUN cd / \
    && tar -xvf sdk.tar \
    && rm -rf sdk.tar

ENV JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF8"

ENTRYPOINT ["sh", "/init.sh"]