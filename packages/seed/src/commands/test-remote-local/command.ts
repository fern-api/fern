import { LogLevel } from "@fern-api/logger";
import path from "path";
import { TaskContextFactory } from "../test/TaskContextFactory";
import { getLatestGeneratorVersions, runTestCase } from "./caseRunner";
import {
    ALL_GENERATOR_NICKNAMES,
    ALL_OUTPUT_MODES,
    ALL_TEST_FIXTURES,
    CLI_RELATIVE_PATH,
    ERROR_NO_GENERATOR_VERSION,
    GeneratorName,
    GeneratorNickname,
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
    logLevel,
    fernRepoDirectory,
    githubToken,
    fernToken
}: {
    generator: string[];
    fixture: string[];
    outputFolder: string;
    logLevel: LogLevel;
    fernRepoDirectory: string;
    githubToken: string;
    fernToken: string;
}): Promise<void> {
    const taskContextFactory = new TaskContextFactory(logLevel);
    const taskContext = taskContextFactory.create("test-remote-local");
    const logger = taskContext.logger;

    // Default to all generators/fixtures if not specified
    const generators = (generator.length > 0 ? generator : ALL_GENERATOR_NICKNAMES) as GeneratorNickname[];
    const fixtures = (fixture.length > 0 ? fixture : ALL_TEST_FIXTURES) as TestFixture[];
    const outputModes: OutputMode[] = Array.from(ALL_OUTPUT_MODES) as OutputMode[];

    logger.info(
        `Starting test-remote-local execution for ${generators.length} generator(s), ${fixtures.length} fixture(s)`
    );
    logger.debug(`Generators: ${generators.join(", ")}`);
    logger.debug(`Fixtures: ${fixtures.join(", ")}`);

    // Fetch latest versions for all generators upfront
    logger.info("\nFetching latest generator versions from Docker Hub...");
    const generatorVersions = await getLatestGeneratorVersions(generators, logger);
    logger.info("Generator versions:");
    for (const [gen, version] of Object.entries(generatorVersions)) {
        logger.info(`  ${gen}: ${version}`);
    }

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

                try {
                    await runTestCase({
                        generator: gen,
                        fixture: fix,
                        outputFolder,
                        outputMode: mode,
                        generatorVersions,
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
                        success: true
                    });

                    logger.info(`${MSG_TEST_PASSED_PREFIX}${gen} / ${fix} / ${mode}`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    results.push({
                        generator: gen,
                        fixture: fix,
                        outputMode: mode,
                        success: false,
                        error: errorMessage
                    });

                    logger.error(
                        `${MSG_TEST_FAILED_PREFIX}${gen}:${fix}:${mode}`,
                        error instanceof Error ? error.message : String(error)
                    );
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
