FROM node:lts-slim

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm install -g pnpm@10.20.0 --force
RUN corepack prepare pnpm@10.20.0
RUN npm install -g yarn@1.22.22 --force
RUN corepack prepare yarn@1.22.22

RUN pnpm add -g typescript@~5.7.2 \
  prettier@3.4.2 \
  oxfmt@0.17.0 \
  @biomejs/biome@2.3.1 \
  oxlint@1.32.0 \
  oxlint-tsgolint@0.8.4 \
  @types/node@^18.19.70 \
  webpack@^5.97.1 \
  msw@2.11.2 \
  vitest@^3.2.4

WORKDIR /

ENTRYPOINT ["tail", "-f", "/dev/null"]
