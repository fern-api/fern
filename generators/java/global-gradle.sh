#!/bin/bash

# Desired Gradle version
GRADLE_VERSION=8.7

# Function to install sdkman if not present and load it
install_and_load_sdkman() {
    # Try sourcing sdkman-init.sh first
    if [ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]; then
        source "$HOME/.sdkman/bin/sdkman-init.sh"
    fi

    # Check if sdk command is available
    if ! command -v sdk &> /dev/null
    then
        echo "sdkman is not installed. Installing sdkman..."
        curl -s "https://get.sdkman.io" | bash
        # Add sdkman to the current shell session's PATH
        export SDKMAN_DIR="$HOME/.sdkman"
        export PATH="$SDKMAN_DIR/bin:$PATH"
        source "$SDKMAN_DIR/bin/sdkman-init.sh"
    else
        source "$HOME/.sdkman/bin/sdkman-init.sh"
    fi
}

# Function to install and set the specified Gradle version
install_and_use_gradle() {
    sdk install gradle $GRADLE_VERSION
    sdk use gradle $GRADLE_VERSION
    export PATH="$SDKMAN_DIR/candidates/gradle/current/bin:$PATH"
}

# Check if Gradle is installed and the correct version
if ! command -v gradle &> /dev/null || ! gradle -v | grep -q "Gradle $GRADLE_VERSION"
then
    echo "Gradle $GRADLE_VERSION is not installed or not the current version. Installing/Updating Gradle..."
    install_and_load_sdkman
    install_and_use_gradle
else
    echo "Gradle $GRADLE_VERSION is already installed and in use."
    install_and_load_sdkman  # Ensure sdkman is loaded so that the correct version is used
    sdk use gradle $GRADLE_VERSION  # Explicitly use the specified version in this session
    export PATH="$SDKMAN_DIR/candidates/gradle/current/bin:$PATH"
fi

# Verify Gradle installation
gradle -v
