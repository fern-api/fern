FROM node:18.1.0-alpine
COPY install_bun.sh /
COPY dist/bundle.js /bundle.js
RUN /install_bun.sh
ENTRYPOINT ["node", "/bundle.js"]
