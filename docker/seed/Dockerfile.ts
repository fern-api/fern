FROM node:lts-slim

RUN  yarn add \
  # jest
  jest@29.7.0 \
  @types/jest@29.5.5 \
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

# Installs tsc
RUN npm install -g typescript

ENTRYPOINT ["tail", "-f", "/dev/null"]
