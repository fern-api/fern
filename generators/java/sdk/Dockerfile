# Stage 1: Java V2
# Non-slim trixie because the patch RUN steps below shell out to curl and tar.
FROM node:24.15-trixie AS node
COPY generators/java-v2/sdk/dist/cli.cjs /dist/cli.cjs
COPY generators/java-v2/sdk/features.yml /assets/features.yml

# Stage 2: Java V1
# Apple Silicon: FROM bitnami/gradle:latest
# Use Corretto to fix January 2026 Oracle CPU CVEs:
# - CVE-2026-21945, CVE-2026-21932, CVE-2026-21925, CVE-2026-21933
FROM gradle:jdk11-corretto

# Remove vulnerable jars from Gradle base image - not used by this generator
# CVE-2025-4949: jgit 5.13.3
# CVE-2022-4065: testng 6.3.1
# CVE-2025-48924: commons-lang 2.6, commons-lang3 3.14.0
# CVE-2020-36843: eddsa 0.3.0
# CVE-2020-29582: kotlin-stdlib (insecure temp file/folder creation in versions < 1.4.21)
RUN rm -f /opt/gradle/lib/plugins/org.eclipse.jgit-*.jar \
       /opt/gradle/lib/plugins/org.eclipse.jgit.ssh.apache-*.jar \
       /opt/gradle/lib/plugins/testng-*.jar \
       /opt/gradle/lib/commons-lang-*.jar \
       /opt/gradle/lib/commons-lang3-*.jar \
       /opt/gradle/lib/plugins/eddsa-*.jar \
       /opt/gradle/lib/kotlin-stdlib-*.jar

# Replace vulnerable plexus-utils in Gradle distribution to fix GHSA-6fmv-xxpf-w3cw
# (Directory Traversal vulnerability in extractFile method)
RUN rm -f /opt/gradle/lib/plugins/plexus-utils-*.jar && \
    curl -sL https://repo1.maven.org/maven2/org/codehaus/plexus/plexus-utils/4.0.3/plexus-utils-4.0.3.jar \
      -o /opt/gradle/lib/plugins/plexus-utils-4.0.3.jar && \
    echo "421ff6ed146c53a9d4eaade8f629b52b12af7187101f1bd06c2c64e904019f3c  /opt/gradle/lib/plugins/plexus-utils-4.0.3.jar" | sha256sum -c -

# Replace vulnerable jackson-core in Gradle distribution to fix GHSA-72hv-8253-57qq
# (async parser bypasses maxNumberLength constraint, leading to potential DoS)
RUN rm -f /opt/gradle/lib/jackson-core-*.jar && \
    curl -sL https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.18.6/jackson-core-2.18.6.jar \
      -o /opt/gradle/lib/jackson-core-2.18.6.jar && \
    echo "e7e1bfa50f0a79db37e6aa37db111cf03aebf4a484b359d21127ab43ab2398c6  /opt/gradle/lib/jackson-core-2.18.6.jar" | sha256sum -c -

# Replace vulnerable Bouncy Castle jars in Gradle distribution to fix CVE-2026-3505
# (bcpg unbounded PGP AEAD chunk size leads to pre-auth resource exhaustion; fixed in 1.84).
# bcprov and bcutil are upgraded in lockstep since bcpg 1.78+ requires a matching bcutil.
RUN rm -f /opt/gradle/lib/plugins/bcpg-jdk18on-*.jar \
          /opt/gradle/lib/plugins/bcprov-jdk18on-*.jar \
          /opt/gradle/lib/plugins/bcutil-jdk18on-*.jar && \
    curl -sL https://repo1.maven.org/maven2/org/bouncycastle/bcpg-jdk18on/1.84/bcpg-jdk18on-1.84.jar \
      -o /opt/gradle/lib/plugins/bcpg-jdk18on-1.84.jar && \
    echo "c0e6303a0d7589040f400950ecee87a14b81312e84ed15e5390ebb0c4566ddab  /opt/gradle/lib/plugins/bcpg-jdk18on-1.84.jar" | sha256sum -c - && \
    curl -sL https://repo1.maven.org/maven2/org/bouncycastle/bcprov-jdk18on/1.84/bcprov-jdk18on-1.84.jar \
      -o /opt/gradle/lib/plugins/bcprov-jdk18on-1.84.jar && \
    echo "64d6c5a6121fcd927152dd182cbed39afe0fda641a970d9bcc0c9cb1858b2731  /opt/gradle/lib/plugins/bcprov-jdk18on-1.84.jar" | sha256sum -c - && \
    curl -sL https://repo1.maven.org/maven2/org/bouncycastle/bcutil-jdk18on/1.84/bcutil-jdk18on-1.84.jar \
      -o /opt/gradle/lib/plugins/bcutil-jdk18on-1.84.jar && \
    echo "b374e16963421fb9cfb01cc20d7ad8fd2f8b8188e3eef0ec0a8965e245f7619a  /opt/gradle/lib/plugins/bcutil-jdk18on-1.84.jar" | sha256sum -c -

# Update packages to get latest security fixes and remove unnecessary packages
# Amazon Linux 2023 uses dnf instead of apt-get
# Note: Amazon Linux 2023 has fewer pre-installed packages than Ubuntu, so we only
# need to update what's present and remove what we don't need
# Security update 2026-02-09: use --releasever=latest to get patches beyond the
# base image's pinned repo snapshot (2023.10.20260120) for CVE-2025-15467,
# CVE-2025-13151, CVE-2025-61726, CVE-2026-21441, CVE-2026-0990, CVE-2026-0992,
# CVE-2026-0989, CVE-2026-22695, CVE-2026-22801, CVE-2019-13232
# Security update 2026-02-20: add gnupg2-minimal (CVE-2026-24882),
# curl-minimal/libcurl-minimal (CVE-2025-13034, CVE-2025-14017, CVE-2025-14524,
# CVE-2025-14819, CVE-2025-15079, CVE-2025-15224), alsa-lib (CVE-2026-25068),
# expat (CVE-2026-25210), openssh/openssh-clients (CVE-2025-61984, CVE-2025-61985)
# Security update 2026-03-30: add freetype (CVE-2026-23865, ALAS2023-2026-1486)
# Security update 2026-04-15: add python3/python3-libs (ALAS2023-2026-1583,
# CVE-2025-11468, CVE-2025-15282, CVE-2026-0672, CVE-2026-0865, CVE-2026-1299,
# CVE-2026-2297, CVE-2026-4224, CVE-2026-4519),
# libnghttp2 (ALAS2023-2026-1542, CVE-2026-27135)
# Security update 2026-05-04: add glibc/glibc-common/glibc-minimal-langpack
# (CVE-2026-4046, iconv() assertion failure when converting IBM1390/IBM1399
# inputs; fixed in glibc 2.34-231.amzn2023.0.4)
RUN dnf --releasever=latest update -y \
    openssl-fips-provider-latest \
    openssl-libs \
    libtasn1 \
    libcap \
    python3-pip-wheel \
    libxml2 \
    libpng \
    unzip \
    gnupg2-minimal \
    curl-minimal \
    libcurl-minimal \
    alsa-lib \
    expat \
    openssh \
    openssh-clients \
    freetype \
    python3 \
    python3-libs \
    libnghttp2 \
    glibc \
    glibc-common \
    glibc-minimal-langpack && \
    dnf remove -y git-lfs wget || true && \
    dnf clean all && \
    rm -rf /var/cache/dnf

COPY generators/java/sdk/build/distributions/sdk.tar generators/java/sdk/init.sh /
RUN cd / \
    && tar -xvf sdk.tar \
    && rm -rf sdk.tar

ENV JAVA_TOOL_OPTIONS="-Xmx4g -Dfile.encoding=UTF8"

# Copy over node contents to be able to run the compiled CLI
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Patch picomatch to 4.0.4 to fix GHSA-c2c7-rcm5-vvqj (ReDoS via extglob quantifiers),
# GHSA-3v7f-55p6-f55p (Method Injection in POSIX Character Classes)
# Location: npm's bundled tinyglobby depends on picomatch
RUN for dir in \
      /usr/local/lib/node_modules/npm/node_modules/tinyglobby/node_modules/picomatch; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz -o picomatch-4.0.4.tgz && \
        tar -xzf picomatch-4.0.4.tgz && \
        mv package picomatch && \
        rm picomatch-4.0.4.tgz; \
      fi; \
    done

# Patch ip-address to 10.2.0 to fix GHSA-v2v4-37r5-5v8g (CVE-2026-42338)
# (XSS in Address6 HTML-emitting methods; fixed in 10.1.1)
# Location: npm bundles its own copy via socks-proxy-agent -> socks -> ip-address
RUN for dir in \
      /usr/local/lib/node_modules/npm/node_modules/ip-address; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/ip-address/-/ip-address-10.2.0.tgz -o ip-address-10.2.0.tgz && \
        tar -xzf ip-address-10.2.0.tgz && \
        mv package ip-address && \
        rm ip-address-10.2.0.tgz; \
      fi; \
    done

# Copy Node CLI from first stage and rename it /bin/java-v2
COPY --from=node /dist/cli.cjs /bin/java-v2
COPY --from=node /assets/features.yml /assets/features.yml
RUN chmod +x /bin/java-v2

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

RUN test -f /bin/java-v2 || echo "java-v2 CLI not found or not executable"

ENTRYPOINT ["sh", "/init.sh"]
