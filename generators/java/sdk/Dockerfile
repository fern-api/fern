# Stage 1: Java V2
# Updated: WebSocket feature support added
FROM node:23.11.1-bookworm AS node
COPY generators/java-v2/sdk/dist/cli.cjs /dist/cli.cjs
COPY generators/java-v2/sdk/features.yml /assets/features.yml

# Stage 2: Java V1
# Apple Silicon: FROM bitnami/gradle:latest
FROM gradle:jdk11-jammy

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

# Remove vulnerable packages not needed at runtime and update vulnerable packages
# CVE-2025-8291, CVE-2025-6075: python3.10 zipfile/expandvars vulnerabilities
# CVE-2024-46901: subversion vulnerability
# Go stdlib CVEs (60+): git-lfs 3.0.2 embeds Go 1.18.1 with many critical vulnerabilities
# CVE-2024-10524, CVE-2021-31879: wget vulnerabilities
# CVE-2025-64720, CVE-2025-65018, CVE-2025-64505, CVE-2025-64506, CVE-2025-66293: libpng16-16 vulnerabilities
# CVE-2021-46848, CVE-2025-13151: libtasn1-6 vulnerabilities
# CVE-2025-68973: gnupg/gpg vulnerabilities
# Use purge instead of remove to fully remove packages from dpkg database
# Add retry logic for apt-get update to handle transient mirror sync issues
RUN set -eux; \
    max=5; \
    count=0; \
    until apt-get update; do \
      count=$((count + 1)); \
      if [ "$count" -ge "$max" ]; then \
        echo "apt-get update failed after ${count} attempts"; \
        exit 1; \
      fi; \
      echo "apt-get update failed, retrying in 20s..."; \
      sleep 20; \
    done; \
    apt-get install -y --only-upgrade libpng16-16 libtasn1-6 \
        dirmngr gnupg gnupg-l10n gnupg-utils gpg gpg-agent \
        gpg-wks-client gpg-wks-server gpgconf gpgsm gpgv && \
    apt-get purge -y --allow-remove-essential \
        python3.10 python3.10-minimal \
        python3 python3-minimal \
        libpython3.10-minimal libpython3.10-stdlib libpython3-stdlib \
        subversion \
        git-lfs \
        wget && \
    apt-get autoremove -y --purge && \
    rm -rf /var/lib/apt/lists/*

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

# Update npm and glob to fix CVE-2025-64756 (glob vulnerability requires 11.1.0+)
RUN npm install -g npm@latest && npm install -g glob@11.1.0

# Patch npm's bundled glob to 11.1.0 (npm bundles its own copy at node_modules/npm/node_modules/glob)
RUN cd /usr/local/lib/node_modules/npm/node_modules && \
    rm -rf glob && \
    npm pack glob@11.1.0 && \
    tar -xzf glob-11.1.0.tgz && \
    mv package glob && \
    rm glob-11.1.0.tgz

# Patch npm's bundled tar to 7.5.3 to fix CVE-2026-23745 (path traversal via hardlinks/symlinks)
RUN cd /usr/local/lib/node_modules/npm/node_modules && \
    rm -rf tar && \
    npm pack tar@7.5.3 && \
    tar -xzf tar-7.5.3.tgz && \
    mv package tar && \
    rm tar-7.5.3.tgz

# Copy Node CLI from first stage and rename it /bin/java-v2
COPY --from=node /dist/cli.cjs /bin/java-v2
COPY --from=node /assets/features.yml /assets/features.yml
RUN chmod +x /bin/java-v2

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

RUN test -f /bin/java-v2 || echo "java-v2 CLI not found or not executable"

RUN npm install -f -g @fern-api/generator-cli@0.5.3

# Patch @octokit/request to fix CVE-2025-25290 (ReDoS vulnerability)
# Use npm pack + tar to replace the package without running npm install (which fails due to workspace: protocol)
# Also install fast-content-type-parse which is a new dependency in @octokit/request@10.0.7
# Note: Skip patching if @octokit directory doesn't exist (may be different in newer versions)
RUN OCTOKIT_DIR="/usr/local/lib/node_modules/@fern-api/generator-cli/node_modules/@octokit" && \
    if [ -d "$OCTOKIT_DIR" ]; then \
        cd "$OCTOKIT_DIR" && \
        rm -rf request && \
        npm pack @octokit/request@10.0.7 && \
        tar -xzf octokit-request-10.0.7.tgz && \
        mv package request && \
        rm octokit-request-10.0.7.tgz && \
        cd /usr/local/lib/node_modules/@fern-api/generator-cli/node_modules && \
        if [ ! -d "fast-content-type-parse" ]; then \
            npm pack fast-content-type-parse@2.0.1 && \
            tar -xzf fast-content-type-parse-2.0.1.tgz && \
            mv package fast-content-type-parse && \
            rm fast-content-type-parse-2.0.1.tgz; \
        fi; \
    else \
        echo "Skipping @octokit/request patch - directory does not exist (may be patched in newer version)"; \
    fi

ENTRYPOINT ["sh", "/init.sh"]
