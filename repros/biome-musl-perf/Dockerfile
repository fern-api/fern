FROM node:22.12-alpine3.20

RUN npm install -g pnpm@10.20.0 --force

WORKDIR /app

COPY sdk/ .

ENV CI=true
RUN pnpm install --ignore-scripts

ENTRYPOINT ["sh"]
