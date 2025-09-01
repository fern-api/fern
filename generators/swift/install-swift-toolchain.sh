#!/bin/bash

# Swift version to install - modify this as needed
SWIFT_VERSION="6.1.2"

# Install swiftly
curl -O https://download.swift.org/swiftly/linux/swiftly-$(uname -m).tar.gz && \
tar zxf swiftly-$(uname -m).tar.gz && \
./swiftly init --quiet-shell-followup && \
. "${SWIFTLY_HOME_DIR:-$HOME/.local/share/swiftly}/env.sh" && \
hash -r

# Install and use the specified Swift version
swiftly install --use $SWIFT_VERSION

# Verify the installation
swift --version