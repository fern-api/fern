export const FERN_REPO_PACKAGE_NAME = "fern";

export const FERN_TEST_REPO_NAME = "fern-api/empty";

export const FERN_CONFIG_JSON_FILENAME = "fern.config.json";

export const FERN_CONFIG_JSON_CONTENT = {
    "organization": "fern",
    "version": "*"
};

export const REMOTE_GROUP_NAME = "remote";
export const LOCAL_GROUP_NAME = "local";

export type GeneratorNickname = "ts-sdk" | "java-sdk" | "go-sdk" | "python-sdk";

export type GeneratorName = "fernapi/fern-typescript-sdk" | "fernapi/fern-java-sdk" | "fernapi/fern-go-sdk" | "fernapi/fern-python-sdk";

export type TestFixture = "imdb" | "exhaustive";

export type OutputMode = "github" | "local-file-system";

export type GenerationMode = "local" | "remote";

export const GeneratorNameFromNickname: Record<GeneratorNickname, GeneratorName> = {
    "ts-sdk": "fernapi/fern-typescript-sdk",
    "java-sdk": "fernapi/fern-java-sdk",
    "go-sdk": "fernapi/fern-go-sdk",
    "python-sdk": "fernapi/fern-python-sdk"
}