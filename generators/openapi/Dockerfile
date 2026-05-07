FROM node:22.22.2-alpine3.22
RUN apk update && apk upgrade --no-cache \
    && npm install -g @stoplight/spectral-cli@6.15.1 --ignore-scripts \
    && echo 'extends: ["spectral:oas"]' > /.spectral.yml \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "openapi"]
