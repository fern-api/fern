FROM node:24.14-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git zip && rm -rf /var/lib/apt/lists/*
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm install -g pnpm@10.33.0 --force
RUN npm install -g yarn@1.22.22 --force
RUN pnpm add -g typescript@~5.9.3 \
  prettier@3.8.1 \
  oxfmt@0.42.0 \
  @biomejs/biome@2.4.9 \
  oxlint@1.57.0 \
  oxlint-tsgolint@0.17.4 \
  @types/node@^18.19.70 \
  ts-loader@^9.5.4 \
  webpack@^5.105.4 \
  msw@2.12.14 \
  vitest@^3.2.4

COPY generators/typescript/sdk/cli/dist/ /

ENTRYPOINT ["node", "--enable-source-maps", "/cli.cjs"]
