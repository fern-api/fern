# Apple Silicon: FROM gradle:latest
FROM gradle:8.5.0-jdk17-jammy

COPY build/distributions/model.tar init.sh /
RUN cd / \
    && tar -xvf model.tar \
    && rm -rf model.tar

ENTRYPOINT ["sh", "/init.sh"]