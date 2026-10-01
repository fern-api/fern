const GENERATOR_BY_LANGUAGE: Record<string, string> = {
    typescript: "fernapi/fern-typescript-sdk",
    python: "fernapi/fern-python-sdk",
    java: "fernapi/fern-java-sdk",
    kotlin: "fernapi/fern-kotlin-sdk",
    go: "fernapi/fern-go-sdk",
    csharp: "fernapi/fern-csharp-sdk",
    php: "fernapi/fern-php-sdk",
    ruby: "fernapi/fern-ruby-sdk-v2",
    rust: "fernapi/fern-rust-sdk",
    swift: "fernapi/fern-swift-sdk",
    cli: "fernapi/fern-cli-generator",
    mcp: "fernapi/fern-mcp-server"
};

export function getSdkConfigGeneratorName(language: string): string | undefined {
    return GENERATOR_BY_LANGUAGE[language];
}
