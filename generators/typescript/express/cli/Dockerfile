FROM node:22.12-alpine3.20

RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm install -g pnpm@10.20.0 --force
RUN npm install -g yarn@1.22.22 --force
RUN pnpm install -g prettier@3.4.2
RUN pnpm install -g oxfmt@0.9.0
RUN pnpm install -g @biomejs/biome@2.3.1
RUN pnpm install -g oxlint@1.25.0
RUN pnpm install -g oxlint-tsgolint@0.4.0

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
    "@biomejs/biome": "2.3.1", \
    "prettier": "3.4.2", \
    "oxfmt": "0.9.0", \
    "oxlint": "1.25.0", \
    "oxlint-tsgolint": "0.4.0", \
    "typescript": "5.7.2", \
    "url-join": "4.0.1" \
  } \
}' > package.json

RUN yarn install --ignore-scripts

RUN rm -rf node_modules
RUN rm -rf yarn.lock

RUN pnpm install

RUN rm -rf /tmp/cache-warm

WORKDIR /

COPY generators/typescript/express/cli/dist /

ENTRYPOINT ["node", "--enable-source-maps", "/cli.cjs"]
