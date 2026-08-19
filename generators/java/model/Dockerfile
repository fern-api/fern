# Apple Silicon: FROM gradle:latest
FROM gradle:8.5.0-jdk17-jammy

# Apply latest Ubuntu security updates so OS package CVEs (libc, openssl,
# zlib, etc.) tracked by grype against the jammy base image are picked up
# at build time.
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get -y autoremove \
    && rm -rf /var/lib/apt/lists/*

# Replace vulnerable jackson-core in Gradle distribution to fix GHSA-72hv-8253-57qq
# (async parser bypasses maxNumberLength constraint, leading to potential DoS)
RUN rm -f /opt/gradle/lib/jackson-core-*.jar && \
    curl -sL https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.18.6/jackson-core-2.18.6.jar \
      -o /opt/gradle/lib/jackson-core-2.18.6.jar && \
    echo "e7e1bfa50f0a79db37e6aa37db111cf03aebf4a484b359d21127ab43ab2398c6  /opt/gradle/lib/jackson-core-2.18.6.jar" | sha256sum -c -

COPY build/distributions/model.tar init.sh /
RUN cd / \
    && tar -xvf model.tar \
    && rm -rf model.tar

ENTRYPOINT ["sh", "/init.sh"]
