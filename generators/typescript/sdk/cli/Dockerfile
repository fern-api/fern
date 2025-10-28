FROM node:22.12-alpine3.20

RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /tmp/cache-warm

RUN echo '{ \
  "name": "cache-warmer", \
  "version": "1.0.0", \
  "devDependencies": { \
    "jest": "^29.7.0", \
    "@types/jest": "^29.5.14", \
    "node-fetch": "^2.7.0", \
    "@types/node-fetch": "^2.6.12", \
    "@types/node": "^18.19.70", \
    "qs": "^6.13.1", \
    "@types/qs": "^6.9.17", \
    "readable-stream": "^4.5.2", \
    "@types/readable-stream": "^4.0.18", \
    "form-data": "^4.0.4", \
    "formdata-node": "^6.0.3", \
    "jest-environment-jsdom": "^29.7.0", \
    "prettier": "3.4.2", \
    "@biomejs/biome": "2.2.5", \
    "ts-jest": "^29.1.1", \
    "typescript": "~5.7.2", \
    "form-data-encoder": "^4.0.2", \
    "ts-loader": "^9.5.1", \
    "webpack": "^5.97.1", \
    "fetch-mock-jest": "^1.5.1", \
    "msw": "2.11.2", \
    "vitest": "^3.2.4" \
  } \
}' > package.json

RUN yarn install

RUN rm -rf node_modules
RUN rm -rf yarn.lock

RUN npm install -g pnpm@10.14.0


RUN pnpm install
# make prettier globally available
RUN pnpm install -g prettier@3.4.2
# make biome globally available
RUN pnpm install -g @biomejs/biome@2.2.5

RUN rm -rf /tmp/cache-warm

WORKDIR /

RUN npm install -f -g @fern-api/generator-cli@0.2.0

COPY generators/typescript/sdk/cli/dist/ /

ENTRYPOINT ["node", "--enable-source-maps", "/cli.cjs"]
