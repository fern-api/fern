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
RUN rm -f /opt/gradle/lib/plugins/org.eclipse.jgit-*.jar \
       /opt/gradle/lib/plugins/org.eclipse.jgit.ssh.apache-*.jar \
       /opt/gradle/lib/plugins/testng-*.jar \
       /opt/gradle/lib/commons-lang-*.jar \
       /opt/gradle/lib/commons-lang3-*.jar \
       /opt/gradle/lib/plugins/eddsa-*.jar

# Remove vulnerable packages not needed at runtime
# CVE-2025-8291, CVE-2025-6075: python3.10 zipfile/expandvars vulnerabilities
# CVE-2024-46901: subversion vulnerability
# Go stdlib CVEs (60+): git-lfs 3.0.2 embeds Go 1.18.1 with many critical vulnerabilities
# CVE-2024-10524, CVE-2021-31879: wget vulnerabilities
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
    apt-get purge -y --allow-remove-essential \
        python3.10 python3.10-minimal \
        python3 python3-minimal \
        libpython3.10-minimal libpython3.10-stdlib libpython3-stdlib \
        subversion \
        git-lfs \
        wget && \
    apt-get autoremove -y --purge && \
    rm -rf /var/lib/apt/lists/*

# Upgrade packages with available security patches to address remaining CVEs
# CVE-2025-59375: libexpat1 (Medium)
# CVE-2025-45582: tar (Medium) - required for sdk.tar extraction
# CVE-2025-8941: libpam (Medium)
# CVE-2025-64505, CVE-2025-64506, CVE-2025-64720, CVE-2025-65018: libpng16-16 (Medium)
# CVE-2025-9820: libgnutls30 (Low)
# CVE-2025-0167, CVE-2025-9086: curl/libcurl (Low)
# CVE-2024-52005: git (Medium) - required for git config
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
    apt-get install -y --only-upgrade \
        libexpat1 \
        tar \
        libpam-modules libpam-modules-bin libpam-runtime libpam0g \
        libpng16-16 \
        libgnutls30 \
        curl libcurl3-gnutls libcurl4 \
        git git-man || true; \
    rm -rf /var/lib/apt/lists/*

COPY generators/java/sdk/build/distributions/sdk.tar generators/java/sdk/init.sh /
RUN cd / \
    && tar -xvf sdk.tar \
    && rm -rf sdk.tar

ENV JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF8"

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

# Copy Node CLI from first stage and rename it /bin/java-v2
COPY --from=node /dist/cli.cjs /bin/java-v2
COPY --from=node /assets/features.yml /assets/features.yml
RUN chmod +x /bin/java-v2

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

RUN test -f /bin/java-v2 || echo "java-v2 CLI not found or not executable"

RUN npm install -f -g @fern-api/generator-cli@0.2.0

# Patch @octokit/request to fix CVE-2025-25290 (ReDoS vulnerability)
# Use npm pack + tar to replace the package without running npm install (which fails due to workspace: protocol)
RUN cd /usr/local/lib/node_modules/@fern-api/generator-cli/node_modules/@octokit && \
    rm -rf request && \
    npm pack @octokit/request@10.0.7 && \
    tar -xzf octokit-request-10.0.7.tgz && \
    mv package request && \
    rm octokit-request-10.0.7.tgz

ENTRYPOINT ["sh", "/init.sh"]
