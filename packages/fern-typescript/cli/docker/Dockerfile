FROM ubuntu:latest
FROM jarredsumner/bun:edge
WORKDIR ~
RUN mkdir -p .bun/cache
ENV BUN_INSTALL_CACHE_DIR=.bun/cache
RUN apk add nodejs npm
COPY dist/bundle.js bundle.js
ENTRYPOINT ["node", "bundle.js"]
