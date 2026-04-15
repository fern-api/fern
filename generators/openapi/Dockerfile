FROM node:22.22.2-alpine3.22
RUN apk update && apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

RUN npm install -g @stoplight/spectral-cli
RUN echo 'extends: ["spectral:oas"]' > /.spectral.yml

COPY dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "openapi"]
