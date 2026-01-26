import type { DockerImageReference } from "../DockerImageReference";
import { Language } from "../Language";

/**
 * Mapping of SDK languages to their Docker image names.
 */
const SDK_DOCKER_IMAGES: Record<Language, string> = {
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
 * Returns the Docker image reference for a given SDK language and version.
 * If no version is specified, uses "latest".
 */
export function getDockerImageReference({ lang, version }: { lang: Language; version?: string }): DockerImageReference {
    const image = SDK_DOCKER_IMAGES[lang];
    const tag = version ?? "latest";
    return {
        image,
        tag
    };
}
