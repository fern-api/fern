import type { Language } from "../Language.js";

/**
 * Mapping of SDK languages to their Docker image names.
 */
export const LANGUAGE_TO_DOCKER_IMAGE: Record<Language, string> = {
    csharp: "fernapi/fern-csharp-sdk",
    go: "fernapi/fern-go-sdk",
    java: "fernapi/fern-java-sdk",
    php: "fernapi/fern-php-sdk",
    python: "fernapi/fern-python-sdk",
    ruby: "fernapi/fern-ruby-sdk",
    rust: "fernapi/fern-rust-sdk",
    swift: "fernapi/fern-swift-sdk",
    typescript: "fernapi/fern-typescript-sdk"
};

/**
 * Mapping of Docker image names to their languages.
 */
export const DOCKER_IMAGE_TO_LANGUAGE: Record<string, Language> = {
    // Client SDKs
    "fernapi/fern-csharp-sdk": "csharp",
    "fernapi/fern-go-sdk": "go",
    "fernapi/fern-java-sdk": "java",
    "fernapi/fern-php-sdk": "php",
    "fernapi/fern-python-sdk": "python",
    "fernapi/fern-ruby-sdk": "ruby",
    "fernapi/fern-rust-sdk": "rust",
    "fernapi/fern-swift-sdk": "swift",
    "fernapi/fern-typescript-sdk": "typescript",

    // Server stubs
    "fernapi/fern-typescript-express": "typescript",
    "fernapi/fern-fastapi-server": "python",
    "fernapi/fern-java-spring": "java"
};

/**
 * Mapping of Docker image names to their changelog documentation URLs.
 */
export const DOCKER_IMAGE_TO_CHANGELOG_URL: Record<string, string> = {
    "fernapi/fern-typescript-sdk": "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
    "fernapi/fern-python-sdk": "https://buildwithfern.com/learn/sdks/generators/python/changelog",
    "fernapi/fern-go-sdk": "https://buildwithfern.com/learn/sdks/generators/go/changelog",
    "fernapi/fern-java-sdk": "https://buildwithfern.com/learn/sdks/generators/java/changelog",
    "fernapi/fern-csharp-sdk": "https://buildwithfern.com/learn/sdks/generators/csharp/changelog",
    "fernapi/fern-php-sdk": "https://buildwithfern.com/learn/sdks/generators/php/changelog",
    "fernapi/fern-ruby-sdk": "https://buildwithfern.com/learn/sdks/generators/ruby/changelog",
    "fernapi/fern-swift-sdk": "https://buildwithfern.com/learn/sdks/generators/swift/changelog"
};
