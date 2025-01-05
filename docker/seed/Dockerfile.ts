FROM node:lts-slim

RUN  yarn add \
  # jest
  jest@^29.7.0 \
  @types/jest@^29.5.14 \
  # node fetch
  node-fetch@^2.7.0 \
  @types/node-fetch@^2.6.12 \
  # node
  @types/node@^17.0.41 \
  # qs
  qs@^6.13.1 \
  @types/qs@^6.9.17 \
  # url join
  url-join@4.0.1 \
  @types/url-join@4.0.1 \
  # readable stream
  readable-stream@^4.5.2 \
  @types/readable-stream@^4.0.18 \
  # form data
  form-data@^4.0.0 \
  # formdata-node
  formdata-node@^6.0.3 \
  # jest env jsdom
  jest-environment-jsdom@^29.7.0 \
  # js base64
  js-base64@3.7.7 \
  # prettier
  prettier@^3.4.2 \
  # ts jest
  ts-jest@^29.1.1 \
  # typescript
  "typescript@~5.7.2" \
  # form data encoder
  form-data-encoder@^4.0.2 \
  # webpack
  ts-loader@^9.5.1 \
  webpack@^5.97.1 \
  # fetch mock jest
  fetch-mock-jest@^1.5.1

# Installs tsc
RUN npm install -g typescript

ENTRYPOINT ["tail", "-f", "/dev/null"]
