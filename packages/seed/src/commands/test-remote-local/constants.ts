export const FERN_REPO_PACKAGE_NAME = "fern";

export const FERN_TEST_REPO_NAME = "fern-api/empty";

export const FERN_CONFIG_JSON_FILENAME = "fern.config.json";

export const FERN_CONFIG_JSON_CONTENT = {
    organization: "fern",
    version: "*"
};

export const REMOTE_GROUP_NAME = "remote";
export const LOCAL_GROUP_NAME = "local";

// Source of truth: const arrays (enables runtime iteration)
export const ALL_GENERATOR_NICKNAMES = ["ts-sdk", "java-sdk", "go-sdk", "python-sdk"] as const;
export const ALL_TEST_FIXTURES = ["imdb", "exhaustive"] as const;
export const ALL_OUTPUT_MODES = ["github", "local"] as const;
export const ALL_GENERATION_MODES = ["local", "remote"] as const;

// Derived types (enables type safety in switch statements)
export type GeneratorNickname = (typeof ALL_GENERATOR_NICKNAMES)[number];
export type TestFixture = (typeof ALL_TEST_FIXTURES)[number];
export type OutputMode = (typeof ALL_OUTPUT_MODES)[number];
export type GenerationMode = (typeof ALL_GENERATION_MODES)[number];

export type GeneratorName =
    | "fernapi/fern-typescript-sdk"
    | "fernapi/fern-java-sdk"
    | "fernapi/fern-go-sdk"
    | "fernapi/fern-python-sdk";

export const GeneratorNameFromNickname: Record<GeneratorNickname, GeneratorName> = {
    "ts-sdk": "fernapi/fern-typescript-sdk",
    "java-sdk": "fernapi/fern-java-sdk",
    "go-sdk": "fernapi/fern-go-sdk",
    "python-sdk": "fernapi/fern-python-sdk"
};
