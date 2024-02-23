# Small ubuntu base image
FROM redhat/ubi9:latest

# Install sdkman
RUN yum update -y
RUN yum -y install git zip unzip
RUN git clone https://github.com/jenv/jenv.git ~/.jenv
RUN echo 'export PATH="$HOME/.jenv/bin:$PATH"' >> ~/.bash_profile
RUN echo 'eval "$(jenv init -)"' >> ~/.bash_profile
RUN source ~/.bash_profile

RUN set -eux; \
    ARCH="$(uname -m)"; \
    case "${ARCH}" in \
       aarch64|arm64) \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk8-binaries/releases/download/jdk8u292-b10/OpenJDK8U-jdk_aarch64_linux_hotspot_8u292b10.tar.gz'; \
         ;; \
       amd64|x86_64) \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk8-binaries/releases/download/jdk8u292-b10/OpenJDK8U-jdk_x64_linux_hotspot_8u292b10.tar.gz'; \
         ;; \
       *) \
         echo "Unsupported arch: ${ARCH}"; \
         exit 1; \
         ;; \
    esac; \
    curl -LfsSo /tmp/openjdk.tar.gz ${BINARY_URL}; \
    mkdir -p /opt/java/openjdk8; \
    cd /opt/java/openjdk8; \
    tar -xf /tmp/openjdk.tar.gz --strip-components=1; \
    rm -rf /tmp/openjdk.tar.gz;

RUN source ~/.bash_profile && jenv add /opt/java/openjdk8

RUN set -eux; \
    ARCH="$(uname -m)"; \
    case "${ARCH}" in \
       aarch64|arm64) \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.9.1%2B1/OpenJDK11U-jdk_aarch64_linux_hotspot_11.0.9.1_1.tar.gz'; \
         ;; \
       amd64|x86_64) \
         BINARY_URL='https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.9.1%2B1/OpenJDK11U-jdk_x64_linux_hotspot_11.0.9.1_1.tar.gz'; \
         ;; \
       *) \
         echo "Unsupported arch: ${ARCH}"; \
         exit 1; \
         ;; \
    esac; \
    curl -LfsSo /tmp/openjdk.tar.gz ${BINARY_URL}; \
    mkdir -p /opt/java/openjdk11; \
    cd /opt/java/openjdk11; \
    tar -xf /tmp/openjdk.tar.gz --strip-components=1; \
    rm -rf /tmp/openjdk.tar.gz;

RUN source ~/.bash_profile && jenv add /opt/java/openjdk11
RUN source ~/.bash_profile && jenv global 11
RUN source ~/.bash_profile && jenv enable-plugin export
RUN source ~/.bash_profile && jenv enable-plugin gradle
