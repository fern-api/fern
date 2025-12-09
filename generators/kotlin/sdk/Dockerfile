# Stage 1: Build the TypeScript generator
FROM node:18.17.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY generators/kotlin/sdk/package.json ./generators/kotlin/sdk/
COPY generators/kotlin/base/package.json ./generators/kotlin/base/
COPY generators/kotlin/ast/package.json ./generators/kotlin/ast/
COPY generators/base/package.json ./generators/base/
COPY packages/commons/fs-utils/package.json ./packages/commons/fs-utils/
COPY packages/ir-sdk/package.json ./packages/ir-sdk/
COPY packages/generator-exec-sdk/package.json ./packages/generator-exec-sdk/

# Install pnpm
RUN npm install -g pnpm@9.4.0

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY generators/kotlin ./generators/kotlin
COPY generators/base ./generators/base
COPY packages/commons/fs-utils ./packages/commons/fs-utils
COPY packages/ir-sdk ./packages/ir-sdk
COPY packages/generator-exec-sdk ./packages/generator-exec-sdk
COPY shared ./shared

# Build the generator
WORKDIR /app/generators/kotlin/sdk
RUN pnpm compile
RUN pnpm dist:cli

# Stage 2: Create the final image
FROM node:18.17.0-alpine

# Install Kotlin and Gradle
RUN apk add --no-cache openjdk11 wget unzip

# Install Gradle
ENV GRADLE_VERSION=8.4
RUN wget https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip && \
    unzip gradle-${GRADLE_VERSION}-bin.zip && \
    mv gradle-${GRADLE_VERSION} /opt/gradle && \
    rm gradle-${GRADLE_VERSION}-bin.zip

ENV PATH="/opt/gradle/bin:${PATH}"

# Copy the built generator
COPY --from=builder /app/generators/kotlin/sdk/cli.cjs /bin/kotlin-sdk
RUN chmod +x /bin/kotlin-sdk

ENTRYPOINT ["/bin/kotlin-sdk"]
