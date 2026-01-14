FROM node:22.12-alpine3.20

RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm install -g pnpm@10.20.0 --force
RUN npm install -g yarn@1.22.22 --force
RUN pnpm add -g typescript@~5.7.2 \
  prettier@3.7.4 \
  oxfmt@0.24.0 \
  @biomejs/biome@2.3.11 \
  oxlint@1.39.0 \
  oxlint-tsgolint@0.11.0 \
  @fern-api/generator-cli@0.5.3 \
  @types/node@^18.19.70 \
  ts-loader@^9.5.1 \
  webpack@^5.97.1 \
  msw@2.11.2 \
  vitest@^3.2.4

COPY generators/typescript/sdk/cli/dist/ /

ENTRYPOINT ["node", "--enable-source-maps", "/cli.cjs"]
