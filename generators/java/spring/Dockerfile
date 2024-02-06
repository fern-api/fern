# Apple Silicon: FROM bitnami/gradle:latest
FROM bitnami/gradle:8.5.0

COPY build/distributions/spring.tar init.sh /
RUN cd / \
    && tar -xvf spring.tar \
    && rm -rf spring.tar

ENTRYPOINT ["sh", "/init.sh"]