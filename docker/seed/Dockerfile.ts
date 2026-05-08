FROM node:24.15.0-trixie-slim

ENV PNPM_STORE_PATH=/.pnpm-cache
ENV YARN_CACHE_FOLDER=/.yarn-cache
ENV PNPM_HOME=/.pnpm
ENV PATH=$PNPM_HOME:$PATH

# Apply latest Debian security updates so that grype-tracked OS package
# vulnerabilities (perl-base, liblzma5, libgnutls30, libpam*, libc*, gpgv,
# libsystemd0, libudev1, libcap2, libtasn1-6, login/passwd, etc.) are
# resolved on top of the base image.
RUN apt-get update \
  && apt-get -y upgrade \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10.33.3 --force
RUN corepack prepare pnpm@10.33.3
RUN npm install -g yarn@1.22.22 --force
RUN corepack prepare yarn@1.22.22

RUN pnpm add -g typescript@~5.7.2 \
  prettier@3.7.4 \
  oxfmt@0.48.0 \
  @biomejs/biome@2.4.3 \
  oxlint@1.63.0 \
  oxlint-tsgolint@0.22.1 \
  @types/node@^18.19.70 \
  webpack@^5.97.1 \
  msw@2.11.2 \
  vitest@^3.2.4

WORKDIR /

ENTRYPOINT ["tail", "-f", "/dev/null"]
