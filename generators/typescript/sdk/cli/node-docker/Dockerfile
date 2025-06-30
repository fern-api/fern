FROM node:20.18-alpine3.20

RUN apk --no-cache add git zip
RUN git config --global user.name "fern" && git config --global user.email "hey@buildwithfern.com"

RUN yarn init --yes

RUN yarn add \
  jest@^29.7.0 \
  @types/jest@^29.5.14 \
  node-fetch@^2.7.0 \
  @types/node-fetch@^2.6.12 \
  @types/node@^18.19.70 \
  url-join@^5.0.0 \
  readable-stream@^4.6.0 \
  @types/readable-stream@^4.0.18 \
  form-data@^4.0.0 \
  formdata-node@^6.0.3 \
  jest-environment-jsdom@^29.7.0 \
  js-base64@^3.7.7 \
  prettier@^3.4.2 \
  ts-jest@^29.1.1 \
  typescript@~5.7.2 \
  form-data-encoder@^4.0.2 \
  ts-loader@^9.5.1 \
  webpack@^5.97.1 \
  fetch-mock-jest@^1.5.1

COPY generators/typescript/sdk/features.yml /assets/features.yml
COPY generators/typescript/asIs/readme/binary-response-addendum.md /assets/readme/binary-response-addendum.md
COPY generators/typescript/asIs/ /assets/asIs
COPY generators/typescript/utils/core-utilities/ /assets/core-utilities
COPY generators/typescript/sdk/cli/node-docker/dist/nodeCli.cjs /nodeCli.cjs

RUN npm install -f -g @fern-api/generator-cli

ENTRYPOINT ["node", "/nodeCli.cjs"]
