import type { Language } from "../Language";

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
