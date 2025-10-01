# Apple Silicon: FROM gradle:latest
FROM gradle:8.5.0-jdk17-jammy

COPY build/distributions/spring.tar init.sh /
RUN cd / \
    && tar -xvf spring.tar \
    && rm -rf spring.tar

ENTRYPOINT ["sh", "/init.sh"]