FROM node:18.1.0-alpine

# # download and unpack prettier plugin, which is used to format the files
# RUN mkdir /prettier-plugin-organize-imports \
# 	&& cd /prettier-plugin-organize-imports \
# 	&& npm pack prettier-plugin-organize-imports \
# 	&& tar -xf prettier-plugin-organize-imports*.tgz \
#  	&& cd package && npm install

COPY bundle.js /bundle.js
ENTRYPOINT ["node", "/bundle.js"]
# ENTRYPOINT ["tail", "-f", "/dev/null"]
