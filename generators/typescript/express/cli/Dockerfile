FROM node:24.14-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git zip && rm -rf /var/lib/apt/lists/*
RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm install -g pnpm@10.20.0 --force && \
    npm install -g yarn@1.22.22 --force
RUN pnpm add -g \
  prettier@3.7.4 \
  oxfmt@0.35.0 \
  @biomejs/biome@2.4.3 \
  oxlint@1.50.0 \
  oxlint-tsgolint@0.14.2

WORKDIR /tmp/cache-warm

RUN echo '{ \
  "name": "cache-warmer", \
  "version": "1.0.0", \
  "devDependencies": { \
    "@types/express": "4.17.16", \
    "@types/node": "17.0.33", \
    "@types/url-join": "4.0.1", \
    "axios": "0.27.2", \
    "esbuild": "0.16.15", \
    "express": "4.18.2", \
    "@biomejs/biome": "2.4.3", \
    "prettier": "3.7.4", \
    "oxfmt": "0.35.0", \
    "oxlint": "1.50.0", \
    "oxlint-tsgolint": "0.14.2", \
    "typescript": "5.7.2", \
    "url-join": "4.0.1" \
  } \
}' > package.json

RUN yarn install --ignore-scripts

RUN rm -rf node_modules yarn.lock

RUN pnpm install

RUN rm -rf /tmp/cache-warm

WORKDIR /

COPY generators/typescript/express/cli/dist /

ENTRYPOINT ["node", "--enable-source-maps", "/cli.cjs"]
