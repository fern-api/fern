FROM node:20.18-alpine3.20

RUN apk --no-cache add git zip \
  && git config --global user.name "fern" \
  && git config --global user.email "hey@buildwithfern.com"

ENV YARN_CACHE_FOLDER=/.yarn

RUN yarn init --yes

RUN  yarn add \
  # jest
  jest@29.7.0 \
  @types/jest@29.5.5 \
  # node fetch
  node-fetch@2.7.0 \
  @types/node-fetch@2.6.9 \
  # node
  @types/node@17.0.33 \
  # qs
  qs@6.11.2 \
  @types/qs@6.9.8 \
  # url join
  url-join@4.0.1 \
  @types/url-join@4.0.1 \
  # readable stream
  readable-stream@4.5.2 \
  @types/readable-stream@4.0.15 \
  # form data
  form-data@4.0.0 \
  # formdata-node
  formdata-node@6.0.3 \
  # jest env jsdom
  jest-environment-jsdom@29.7.0 \
  # js base64
  "js-base64@3.7.2" \
  # prettier
  prettier@2.7.1 \
  # ts jest
  ts-jest@29.1.1 \
  # typescript
  "typescript@4.6.4" \
  # form data encoder
  form-data-encoder@4.0.2 \
  # webpack
  ts-loader@9.3.1 \
  webpack@5.94.0 \
  # fetch mock jest
  fetch-mock-jest@1.5.1

COPY generators/typescript/utils/core-utilities/fetcher/src/ /assets/fetcher
COPY generators/typescript/utils/core-utilities/callback-queue/src/ /assets/callback-queue
COPY generators/typescript/utils/core-utilities/auth/src/ /assets/auth
COPY generators/typescript/utils/core-utilities/zurg/src/ /assets/zurg
COPY generators/typescript/utils/core-utilities/base/src/ /assets/base-core-utilities
COPY generators/typescript/utils/core-utilities/utils/src/ /assets/utils
COPY generators/typescript/sdk/features.yml /assets/features.yml

COPY generators/typescript/sdk/cli/node-docker/dist/nodeCli.cjs /nodeCli.cjs

ENTRYPOINT ["node", "/nodeCli.cjs"]
