import { LogLevel } from "@fern-api/logger";
import path from "path";
import { loadGeneratorWorkspaces } from "../../loadGeneratorWorkspaces";
import { buildGeneratorImage } from "../img/buildGeneratorImage";
import { TaskContextFactory } from "../test/TaskContextFactory";
import { getLatestGeneratorVersions, getLocalGeneratorVersions, runTestCase } from "./caseRunner";
import {
    ALL_GENERATOR_NICKNAMES,
    ALL_OUTPUT_MODES,
    ALL_TEST_FIXTURES,
    CLI_RELATIVE_PATH,
    ERROR_NO_GENERATOR_VERSION,
    GeneratorName,
    GeneratorNickname,
    LOCAL_BUILD_VERSION,
    LOG_HEADER_TEST_SUMMARY,
    LOG_SEPARATOR,
    MSG_ALL_TESTS_PASSED,
    MSG_TEST_FAILED_PREFIX,
    MSG_TEST_PASSED_PREFIX,
    MSG_TESTS_FAILED_TEMPLATE,
    OUTPUT_MODE_SUFFIX,
    OutputMode,
    SEED_REMOTE_LOCAL_OUTPUT_DIR,
    TestFixture
} from "./constants";

interface TestResult {
    generator: GeneratorNickname;
    fixture: TestFixture;
    outputMode: OutputMode;
    success: boolean;
    error?: string;
}

export async function executeTestRemoteLocalCommand({
    generator,
    fixture,
    outputFolder,
    outputMode,
    logLevel,
    fernRepoDirectory,
    githubToken,
    fernToken,
    buildGenerator = false
}: {
    generator: string[];
    fixture: string[];
    outputFolder: string;
    outputMode: string[];
    logLevel: LogLevel;
    fernRepoDirectory: string;
    githubToken: string;
    fernToken: string;
    buildGenerator?: boolean;
}): Promise<void> {
    const taskContextFactory = new TaskContextFactory(logLevel);
    const taskContext = taskContextFactory.create("test-remote-local");
    const logger = taskContext.logger;

    // Default to all generators/fixtures/output modes if not specified
    const generators = (generator.length > 0 ? generator : ALL_GENERATOR_NICKNAMES) as GeneratorNickname[];
    const fixtures = (fixture.length > 0 ? fixture : ALL_TEST_FIXTURES) as TestFixture[];
    const outputModes: OutputMode[] = (
        outputMode.length > 0 ? outputMode : Array.from(ALL_OUTPUT_MODES)
    ) as OutputMode[];

    logger.info(
        `Starting test-remote-local execution for ${generators.length} generator(s), ${fixtures.length} fixture(s), ${outputModes.length} output mode(s)`
    );
    logger.debug(`Generators: ${generators.join(", ")}`);
    logger.debug(`Fixtures: ${fixtures.join(", ")}`);
    logger.debug(`Output modes: ${outputModes.join(", ")}`);

    // Build generator Docker images if requested
    if (buildGenerator) {
        logger.info(`\nBuilding generator Docker images at version ${LOCAL_BUILD_VERSION}...`);
        await buildGeneratorsAtVersion(generators, fernRepoDirectory, taskContext, logLevel);
        logger.info("Successfully built all generator Docker images");
    }

    // Fetch versions for generators
    // - Local generation: uses LOCAL_BUILD_VERSION if built locally, otherwise latest from Docker Hub
    // - Remote generation: always uses latest from Docker Hub
    logger.info("\nFetching generator versions...");
    const localGeneratorVersions = buildGenerator
        ? await getLocalGeneratorVersions(generators, logger)
        : await getLatestGeneratorVersions(generators, logger);
    const remoteGeneratorVersions = await getLatestGeneratorVersions(generators, logger);
    logger.info("Successfully fetched all generator versions");

    const results: TestResult[] = [];
    const fernExecutable = path.join(fernRepoDirectory, CLI_RELATIVE_PATH);

    // Sequential execution (no parallelization)
    for (const gen of generators) {
        for (const fix of fixtures) {
            for (const mode of outputModes) {
                // Working directory includes the output mode subdirectory
                // Structure: seed-remote-local/{generator}/{fixture}/{outputFolder}/{outputMode}/
                const testWorkingDirectory = path.join(
                    fernRepoDirectory,
                    SEED_REMOTE_LOCAL_OUTPUT_DIR,
                    gen,
                    fix,
                    outputFolder,
                    mode + OUTPUT_MODE_SUFFIX
                );

                logger.info(`\n${LOG_SEPARATOR}`);
                logger.info(`Running test: ${gen} / ${fix} / ${mode}`);
                logger.info(LOG_SEPARATOR);

                const result = await runTestCase({
                    generator: gen,
                    fixture: fix,
                    outputFolder,
                    outputMode: mode,
                    localGeneratorVersions,
                    remoteGeneratorVersions,
                    context: {
                        fernExecutable,
                        fernRepoDirectory,
                        workingDirectory: testWorkingDirectory,
                        logger,
                        githubToken,
                        fernToken
                    }
                });

                results.push({
                    generator: gen,
                    fixture: fix,
                    outputMode: mode,
                    success: result.success,
                    error: result.error
                });

                if (result.success) {
                    logger.info(`${MSG_TEST_PASSED_PREFIX}${gen} / ${fix} / ${mode}`);
                } else {
                    logger.error(`${MSG_TEST_FAILED_PREFIX}${gen}:${fix}:${mode}`, result.error || "Unknown error");
                }
            }
        }
    }

    // Print summary
    logger.info(`\n${LOG_SEPARATOR}`);
    logger.info(LOG_HEADER_TEST_SUMMARY);
    logger.info(LOG_SEPARATOR);

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const total = results.length;

    logger.info(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);

    if (failed > 0) {
        logger.info("\nFailed tests:");
        for (const result of results.filter((r) => !r.success)) {
            logger.error(`  ${MSG_TEST_FAILED_PREFIX}${result.generator} / ${result.fixture} / ${result.outputMode}`);
            if (result.error) {
                logger.error(`    ${result.error}`);
            }
        }
    }

    if (failed > 0) {
        throw new Error(MSG_TESTS_FAILED_TEMPLATE(failed));
    }

    logger.info(`\n${MSG_ALL_TESTS_PASSED}`);
}

/**
 * Builds generator Docker images at LOCAL_BUILD_VERSION using the existing seed img command
 */
async function buildGeneratorsAtVersion(
    generatorNicknames: readonly GeneratorNickname[],
    fernRepoDirectory: string,
    parentContext: { logger: import("@fern-api/logger").Logger },
    logLevel: LogLevel
): Promise<void> {
    // Load all generator workspaces
    const allGenerators = await loadGeneratorWorkspaces();

    // Build each generator at LOCAL_BUILD_VERSION
    const version = LOCAL_BUILD_VERSION;

    for (const nickname of generatorNicknames) {
        const generator = allGenerators.find((g) => g.workspaceName === nickname);
        if (!generator) {
            throw new Error(`Generator ${nickname} not found in loaded workspaces`);
        }

        const taskContextFactory = new TaskContextFactory(logLevel);
        const taskContext = taskContextFactory.create(`Building ${nickname}`);

        parentContext.logger.info(`Building ${nickname} at version ${version}...`);

        await buildGeneratorImage({
            generator,
            version,
            context: taskContext,
            logLevel
        });

        parentContext.logger.info(`✓ Successfully built ${nickname}:${version}`);
    }
}
