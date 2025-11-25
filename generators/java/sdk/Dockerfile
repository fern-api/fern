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

# Remove python3.10 and subversion to address CVEs (not needed at runtime)
# CVE-2025-8291, CVE-2025-6075: python3.10 zipfile/expandvars vulnerabilities
# CVE-2024-46901: subversion vulnerability
# These packages are only used by mercurial/brz which are not needed by this generator
# Use purge instead of remove to fully remove packages from dpkg database
RUN apt-get update && \
    apt-get purge -y --allow-remove-essential \
        python3.10 python3.10-minimal \
        python3 python3-minimal \
        libpython3.10-minimal libpython3.10-stdlib libpython3-stdlib \
        subversion && \
    apt-get autoremove -y --purge && \
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
