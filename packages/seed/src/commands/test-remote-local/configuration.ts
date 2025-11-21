import type { Logger } from "@fern-api/logger";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import {
    FERN_DIRECTORY_NAME,
    FERN_TEST_REPO_NAME,
    GenerationMode,
    GeneratorNameFromNickname,
    GeneratorNickname,
    GITHUB_OUTPUT_MODE_PULL_REQUEST,
    GITHUB_TOKEN_ENV_VAR_REFERENCE,
    GO_SDK_MODULE_PATH,
    JAVA_SDK_MAVEN_COORDINATE,
    LOCAL_GROUP_NAME,
    PACKAGE_LOCATION_LOCAL_FILE_SYSTEM,
    PACKAGE_LOCATION_MAVEN,
    PACKAGE_LOCATION_NPM,
    PACKAGE_LOCATION_PYPI,
    PYTHON_SDK_PACKAGE_NAME,
    REMOTE_GROUP_NAME,
    SDKS_DIRECTORY_NAME,
    SEED_REMOTE_LOCAL_OUTPUT_DIR,
    TestFixture,
    TS_SDK_PACKAGE_NAME
} from "./constants";
import type { RemoteLocalSeedConfig, RemoteVsLocalTestCase } from "./types";

export async function writeGeneratorsYml(
    fernDirectory: string,
    localConfig: unknown,
    remoteConfig: unknown
): Promise<void> {
    const structuredContent = {
        groups: {
            [REMOTE_GROUP_NAME]: {
                generators: [remoteConfig]
            },
            [LOCAL_GROUP_NAME]: {
                generators: [localConfig]
            }
        }
    };
    const schemaComment = "# yaml-language-server: $schema=https://schema.buildwithfern.dev/generators-yml.json";
    const content = schemaComment + "\n" + yaml.dump(structuredContent, { lineWidth: -1 });
    await writeFile(path.join(fernDirectory, "generators.yml"), content);
}

export async function loadCustomConfig(
    generator: GeneratorNickname,
    fixture: string,
    outputFolder: string | undefined,
    fernRepoDirectory: string,
    logger: Logger
): Promise<unknown | undefined> {
    logger.debug(`Looking for custom config for ${generator}/${fixture}/${outputFolder || "no-custom-config"}`);

    const baseConfig = generator === "go-sdk" ? { module: { path: GO_SDK_MODULE_PATH } } : undefined;
    logger.debug(`Base config: ${JSON.stringify(baseConfig)}`);

    // Load seed.yml from seed-remote-local/{generator}/seed.yml
    const seedYmlPath = path.join(fernRepoDirectory, SEED_REMOTE_LOCAL_OUTPUT_DIR, generator, "seed.yml");

    try {
        const seedYmlContent = await readFile(seedYmlPath, "utf-8");
        const seedConfig = yaml.load(seedYmlContent) as RemoteLocalSeedConfig;

        // Look for fixture-specific config
        const fixtureConfigs = seedConfig.fixtures?.[fixture];
        if (!fixtureConfigs || fixtureConfigs.length === 0) {
            logger.debug(`No fixture config found in seed.yml for ${fixture}, using defaults`);
            return baseConfig;
        }

        // Find the config matching the outputFolder
        const matchingConfig = fixtureConfigs.find(
            (config) => config.outputFolder === (outputFolder || "no-custom-config")
        );

        if (!matchingConfig) {
            logger.debug(
                `No matching outputFolder config found for ${outputFolder || "no-custom-config"}, using defaults`
            );
            return baseConfig;
        }

        if (matchingConfig.customConfig !== undefined && matchingConfig.customConfig !== null) {
            logger.debug(`Loaded custom config from seed.yml: ${JSON.stringify(matchingConfig.customConfig)}`);
            return {
                ...baseConfig,
                ...matchingConfig.customConfig
            };
        }

        logger.debug(`Custom config is null/undefined, using defaults`);
        return baseConfig;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            logger.debug(`No seed.yml found at ${seedYmlPath}, using defaults`);
            return baseConfig;
        }
        logger.warn(`Error loading seed.yml: ${error instanceof Error ? error.message : String(error)}`);
        return baseConfig;
    }
}

export function getGithubConfig(generator: GeneratorNickname, generationMode: GenerationMode): unknown | undefined {
    if (generationMode === "remote") {
        return {
            repository: FERN_TEST_REPO_NAME,
            mode: GITHUB_OUTPUT_MODE_PULL_REQUEST
        };
    } else if (generationMode === "local") {
        return {
            uri: FERN_TEST_REPO_NAME,
            token: GITHUB_TOKEN_ENV_VAR_REFERENCE,
            mode: GITHUB_OUTPUT_MODE_PULL_REQUEST
        };
    } else {
        throw new Error(`Generation mode ${generationMode} not supported`);
    }
}

export function getPackageOutputConfig(
    testCase: RemoteVsLocalTestCase,
    generationMode: GenerationMode
): unknown | undefined {
    const { generator, outputMode } = testCase;
    const { workingDirectory } = testCase.context;

    if (outputMode === "github") {
        switch (generator) {
            case "ts-sdk":
                return {
                    location: PACKAGE_LOCATION_NPM,
                    "package-name": TS_SDK_PACKAGE_NAME
                };
            case "java-sdk":
                return {
                    location: PACKAGE_LOCATION_MAVEN,
                    coordinate: JAVA_SDK_MAVEN_COORDINATE
                };
            case "php-sdk":
                return undefined;
            case "python-sdk":
                return {
                    location: PACKAGE_LOCATION_PYPI,
                    "package-name": PYTHON_SDK_PACKAGE_NAME
                };
            case "go-sdk":
                return undefined;
            default:
                throw new Error(`Generator ${generator} not supported`);
        }
    } else if (outputMode === "local") {
        const absoluteOutputPath = path.join(workingDirectory, SDKS_DIRECTORY_NAME, generationMode + "Generation");
        const fernDirectory = path.join(workingDirectory, FERN_DIRECTORY_NAME);
        // Calculate relative path from generators.yml location (fern/generators.yml) to output directory
        const relativePath = path.relative(fernDirectory, absoluteOutputPath);

        return {
            location: PACKAGE_LOCATION_LOCAL_FILE_SYSTEM,
            path: relativePath
        };
    } else {
        throw new Error(`Output mode ${outputMode} not supported`);
    }
}
