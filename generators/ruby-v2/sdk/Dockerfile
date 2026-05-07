FROM ruby:3.3-alpine3.23

# Bumped from ruby:3.3-alpine3.20 to ruby:3.3-alpine3.23. Alpine 3.20 is EOL and
# ships outdated openssl/musl/busybox/zlib/curl/git. Alpine 3.23 ships:
#   - openssl 3.5.6, musl 1.2.5-r23, busybox 1.37.0-r30, zlib 1.3.2-r0
#   - curl 8.17.0, git 2.52.0, nghttp2-libs 1.69.0, sqlite-libs 3.51.2,
#     ada-libs 3.3.0, c-ares 1.34.6
#   - Ruby 3.3.11 with updated default gems (resolv 0.3.1, zlib 3.1.2,
#     rexml 3.4.4, uri 0.13.3)
# This single image bump resolves the bulk of the OS-level and Ruby
# default-gem CVEs flagged by grype on the ruby-sdk container, plus picks up
# updated nodejs/npm bundled package versions.
#
# `build-base` (which pulls in binutils, gcc, etc. -- a steady source of grype
# noise) is only required to compile native gem extensions during install.
# It is added as a virtual `.build-deps` package and removed after gem install
# completes so it does not contribute CVEs to the final runtime image.
RUN apk --no-cache upgrade && \
    apk --no-cache add \
        bash \
        curl \
        git \
        zip \
        nodejs \
        npm && \
    apk --no-cache add --virtual .build-deps \
        make \
        gcc \
        libc-dev && \
    # Update the remaining vulnerable Ruby gems shipped with the base image:
    # - erb 4.0.3 -> 4.0.3.1 (GHSA-q339-8rmv-2mhv: deserialization guard bypass)
    # - net-imap 0.4.21 -> 0.4.24 (GHSA-vcgp-9326-pqcp STARTTLS stripping,
    #   GHSA-75xq-5h9v-w6px command injection, GHSA-87pf-fpwv-p7m7 SCRAM DoS,
    #   GHSA-hm49-wcqc-g2xg "raw" command injection, GHSA-q2mw-fvj9-vvcw response DoS)
    # Ruby ships erb as a default gem and net-imap as a preinstalled gem; simply
    # running `gem install` leaves the original gemspec on disk and SBOM scanners
    # (grype) still report the old version, so remove the stale gemspecs after
    # installing the patched versions.
    gem install --no-document \
        erb:4.0.3.1 \
        net-imap:0.4.24 && \
    rm -f /usr/local/lib/ruby/gems/3.3.0/specifications/default/erb-*.gemspec \
          /usr/local/lib/ruby/gems/3.3.0/specifications/net-imap-0.4.21.gemspec && \
    gem install --no-document 'rubocop:~> 1.21' rubocop-minitest && \
    apk del .build-deps

# Patch npm's bundled vulnerable packages. Following the same pattern used in
# generators/java/sdk/Dockerfile.
# - tar 7.5.9 -> 7.5.11 (GHSA-r6q2-hw4h-h46w, GHSA-9ppj-qmqm-q256, GHSA-qffp-2rhf-9h96).
# Use curl + tar (instead of npm pack) because npm pack depends on tar itself.
RUN for dir in \
      /usr/lib/node_modules/npm/node_modules/tar; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/tar/-/tar-7.5.11.tgz -o tar-7.5.11.tgz && \
        tar -xzf tar-7.5.11.tgz && \
        mv package tar && \
        rm tar-7.5.11.tgz; \
      fi; \
    done

# - minimatch 10.2.2 -> 10.2.3 (GHSA-7r86-cg39-jmmj, GHSA-3ppc-4f35-3m26,
#   GHSA-23c5-xmqv-rm74: ReDoS via combinatorial backtracking).
RUN for dir in \
      /usr/lib/node_modules/npm/node_modules/minimatch \
      /usr/lib/node_modules/npm/node_modules/glob/node_modules/minimatch \
      /usr/lib/node_modules/npm/node_modules/@tufjs/models/node_modules/minimatch; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/minimatch/-/minimatch-10.2.3.tgz -o minimatch-10.2.3.tgz && \
        tar -xzf minimatch-10.2.3.tgz && \
        mv package minimatch && \
        rm minimatch-10.2.3.tgz; \
      fi; \
    done

# - ip-address 10.1.0 -> 10.1.1 (GHSA-v2v4-37r5-5v8g: XSS in Address6 HTML methods).
RUN for dir in \
      /usr/lib/node_modules/npm/node_modules/ip-address; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/ip-address/-/ip-address-10.1.1.tgz -o ip-address-10.1.1.tgz && \
        tar -xzf ip-address-10.1.1.tgz && \
        mv package ip-address && \
        rm ip-address-10.1.1.tgz; \
      fi; \
    done

# - picomatch 4.0.3 -> 4.0.4 (GHSA-c2c7-rcm5-vvqj ReDoS via extglob quantifiers,
#   GHSA-3v7f-55p6-f55p method injection in POSIX character classes).
RUN for dir in \
      /usr/lib/node_modules/npm/node_modules/picomatch \
      /usr/lib/node_modules/npm/node_modules/tinyglobby/node_modules/picomatch; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/picomatch/-/picomatch-4.0.4.tgz -o picomatch-4.0.4.tgz && \
        tar -xzf picomatch-4.0.4.tgz && \
        mv package picomatch && \
        rm picomatch-4.0.4.tgz; \
      fi; \
    done

# - @isaacs/brace-expansion 5.0.0 -> 5.0.1 (GHSA-7h2j-956f-4vf2 ReDoS).
# This is a separate package from npm's `brace-expansion`, scoped under @isaacs.
RUN for dir in \
      /usr/lib/node_modules/npm/node_modules/@isaacs/brace-expansion; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/@isaacs/brace-expansion/-/brace-expansion-5.0.1.tgz -o brace-expansion-5.0.1.tgz && \
        tar -xzf brace-expansion-5.0.1.tgz && \
        mv package brace-expansion && \
        rm brace-expansion-5.0.1.tgz; \
      fi; \
    done

# - brace-expansion 5.0.3 -> 5.0.5 (GHSA-f886-m6hf-6m8v: zero-step sequence hangs).
RUN for dir in \
      /usr/lib/node_modules/npm/node_modules/brace-expansion; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/brace-expansion/-/brace-expansion-5.0.5.tgz -o brace-expansion-5.0.5.tgz && \
        tar -xzf brace-expansion-5.0.5.tgz && \
        mv package brace-expansion && \
        rm brace-expansion-5.0.5.tgz; \
      fi; \
    done

# - diff 8.0.2 -> 8.0.3 (GHSA-73rr-hh4g-fpgx ReDoS in normal/json/css patches).
RUN for dir in \
      /usr/lib/node_modules/npm/node_modules/diff; do \
      if [ -d "$dir" ]; then \
        rm -rf "$dir" && \
        cd "$(dirname "$dir")" && \
        curl -sL https://registry.npmjs.org/diff/-/diff-8.0.3.tgz -o diff-8.0.3.tgz && \
        tar -xzf diff-8.0.3.tgz && \
        mv package diff && \
        rm diff-8.0.3.tgz; \
      fi; \
    done

RUN git config --global user.email "115122769+fern-api[bot]@users.noreply.github.com" && \
    git config --global user.name "fern-api"

ARG SENTRY_DSN
ARG SENTRY_ENVIRONMENT=production
ARG SENTRY_RELEASE
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ENVIRONMENT=$SENTRY_ENVIRONMENT
ENV SENTRY_RELEASE=$SENTRY_RELEASE

COPY generators/ruby-v2/sdk/features.yml /assets/features.yml
COPY generators/ruby-v2/sdk/dist /dist

ENTRYPOINT ["node", "--enable-source-maps", "/dist/cli.cjs"]
