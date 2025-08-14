# Apple Silicon: FROM bitnami/gradle:latest
FROM us-east1-docker.pkg.dev/sayari-datastore/bitnami/gradle:8.5.0

COPY build/distributions/spring.tar init.sh /
RUN cd / \
    && tar -xvf spring.tar \
    && rm -rf spring.tar

ENTRYPOINT ["sh", "/init.sh"]