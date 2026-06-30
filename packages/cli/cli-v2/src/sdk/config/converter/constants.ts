import type { Language } from "../Language.js";

/**
 * Mapping of SDK languages to their Docker image names.
 */
export const LANGUAGE_TO_DOCKER_IMAGE: Record<Language, string> = {
    csharp: "fernenterprise/fern-csharp-sdk",
    go: "fernenterprise/fern-go-sdk",
    java: "fernenterprise/fern-java-sdk",
    php: "fernenterprise/fern-php-sdk",
    python: "fernenterprise/fern-python-sdk",
    ruby: "fernenterprise/fern-ruby-sdk",
    rust: "fernenterprise/fern-rust-sdk",
    swift: "fernenterprise/fern-swift-sdk",
    typescript: "fernenterprise/fern-typescript-sdk"
};

/**
 * Mapping of Docker image names to their languages.
 */
export const DOCKER_IMAGE_TO_LANGUAGE: Record<string, Language> = {
    "fernenterprise/fern-csharp-sdk": "csharp",
    "fernenterprise/fern-go-sdk": "go",
    "fernenterprise/fern-java-sdk": "java",
    "fernenterprise/fern-php-sdk": "php",
    "fernenterprise/fern-python-sdk": "python",
    "fernenterprise/fern-ruby-sdk": "ruby",
    "fernenterprise/fern-rust-sdk": "rust",
    "fernenterprise/fern-swift-sdk": "swift",
    "fernenterprise/fern-typescript-sdk": "typescript",
    "fernenterprise/fern-typescript-express": "typescript",
    "fernenterprise/fern-fastapi-server": "python",
    "fernenterprise/fern-java-spring": "java"
};

/**
 * Mapping of Docker image names to their Fern registry generator IDs.
 *
 * Mirrors the logic in `getGeneratorMetadataFromName` from
 * `@fern-api/configuration-loader`.
 */
export const DOCKER_IMAGE_TO_GENERATOR_ID: Record<string, string> = {
    "fernenterprise/fern-python-sdk": "python-sdk",
    "fernenterprise/fern-pydantic-model": "pydantic",
    "fernenterprise/fern-fastapi-server": "fastapi",
    "fernenterprise/fern-typescript": "ts-sdk",
    "fernenterprise/fern-typescript-browser-sdk": "ts-sdk",
    "fernenterprise/fern-typescript-node-sdk": "ts-sdk",
    "fernenterprise/fern-typescript-sdk": "ts-sdk",
    "fernenterprise/fern-typescript-express": "ts-express",
    "fernenterprise/fern-java-sdk": "java-sdk",
    "fernenterprise/fern-java-model": "java-model",
    "java-model": "java-model",
    "fernenterprise/fern-java-spring": "java-spring",
    "fernenterprise/fern-go-sdk": "go-sdk",
    "fernenterprise/fern-go-model": "go-model",
    "fernenterprise/fern-csharp-sdk": "csharp-sdk",
    "fernenterprise/fern-csharp-model": "csharp-model",
    "fernenterprise/fern-ruby-sdk": "ruby-sdk-v2",
    "fernenterprise/fern-ruby-sdk-v2": "ruby-sdk-v2",
    "fernenterprise/fern-php-sdk": "php-sdk",
    "fernenterprise/fern-php-model": "php-model",
    "fernenterprise/fern-rust-sdk": "rust-sdk",
    "fernenterprise/fern-rust-model": "rust-model",
    "fernenterprise/fern-swift-sdk": "swift-sdk",
    "fernenterprise/fern-swift-model": "swift-model",
    "fernenterprise/fern-postman": "postman",
    "fernenterprise/fern-openapi": "openapi",
    "fernenterprise/fern-cli-generator": "cli"
};

/**
 * Mapping of Docker image names to their changelog documentation URLs.
 */
export const DOCKER_IMAGE_TO_CHANGELOG_URL: Record<string, string> = {
    "fernenterprise/fern-typescript-sdk": "https://buildwithfern.com/learn/sdks/generators/typescript/changelog",
    "fernenterprise/fern-python-sdk": "https://buildwithfern.com/learn/sdks/generators/python/changelog",
    "fernenterprise/fern-go-sdk": "https://buildwithfern.com/learn/sdks/generators/go/changelog",
    "fernenterprise/fern-java-sdk": "https://buildwithfern.com/learn/sdks/generators/java/changelog",
    "fernenterprise/fern-csharp-sdk": "https://buildwithfern.com/learn/sdks/generators/csharp/changelog",
    "fernenterprise/fern-php-sdk": "https://buildwithfern.com/learn/sdks/generators/php/changelog",
    "fernenterprise/fern-ruby-sdk": "https://buildwithfern.com/learn/sdks/generators/ruby/changelog",
    "fernenterprise/fern-swift-sdk": "https://buildwithfern.com/learn/sdks/generators/swift/changelog"
};
