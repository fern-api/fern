# Apple Silicon: FROM bitnami/gradle:latest
FROM us-east1-docker.pkg.dev/sayari-datastore/bitnami/gradle:8.5.0

COPY build/distributions/model.tar init.sh /
RUN cd / \
    && tar -xvf model.tar \
    && rm -rf model.tar

ENTRYPOINT ["sh", "/init.sh"]