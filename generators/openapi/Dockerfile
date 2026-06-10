FROM node:24.16-alpine3.23
# Security update 2026-06-10: openssl 3.5.6 → 3.5.7 (12 CVEs including
# CVE-2026-45447 heap use-after-free in PKCS7_verify, High severity).
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache --upgrade libssl3 libcrypto3 \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY dist /dist
ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs", "openapi"]
