FROM node:18.1.0-alpine
COPY install_bun.sh /
RUN /install_bun.sh
COPY dist/bundle.js /bundle.js
ENTRYPOINT ["node", "/bundle.js"]
