# FROM ubuntu:16.04
FROM gradle:latest

# Setup sdkman
RUN apt-get update
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get -q -y install curl zip unzip
RUN curl -s https://get.sdkman.io | bash
RUN chmod a+x "$HOME/.sdkman/bin/sdkman-init.sh"

RUN source "$HOME/.sdkman/bin/sdkman-init.sh" && sdk install java 8.0.392-zulu
RUN source "$HOME/.sdkman/bin/sdkman-init.sh" && sdk install java 11.0.21-zulu

COPY ./ ./
RUN ./gradlew install
