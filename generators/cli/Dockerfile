FROM node:24.16-trixie-slim
RUN apt-get update \
    && apt-get -y --no-install-recommends dist-upgrade \
    && apt-get -y autoremove \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
