import { LogLevel } from "@fern-api/logger";
import path from "path";
import { TaskContextFactory } from "../test/TaskContextFactory";
import { runTestCase } from "./caseRunner";
import { ALL_GENERATOR_NICKNAMES, ALL_OUTPUT_MODES, ALL_TEST_FIXTURES, GeneratorNickname, OutputMode, TestFixture } from "./constants";

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
    workingDirectory,
    githubToken,
    fernToken
}: {
    generator: string[];
    fixture: string[];
    outputFolder: string;
    logLevel: LogLevel;
    workingDirectory: string;
    githubToken: string;
    fernToken: string;
}): Promise<void> {
    const taskContextFactory = new TaskContextFactory(logLevel);
    const taskContext = taskContextFactory.create("test-remote-local");
    const logger = taskContext.logger;

    // Default to all generators/fixtures if not specified
    const generators = (generator.length > 0 ? generator : ALL_GENERATOR_NICKNAMES) as GeneratorNickname[];
    const fixtures = (fixture.length > 0 ? fixture : ALL_TEST_FIXTURES) as TestFixture[];
    const outputModes: OutputMode[] = ["local-file-system"]; // Default to local-file-system for now

    logger.info(`Starting test-remote-local execution for ${generators.length} generator(s), ${fixtures.length} fixture(s)`);
    logger.debug(`Generators: ${generators.join(", ")}`);
    logger.debug(`Fixtures: ${fixtures.join(", ")}`);

    const results: TestResult[] = [];
    const fernExecutable = path.join(workingDirectory, "packages", "cli", "cli", "dist", "prod", "cli.cjs");
    const fernRepoDirectory = workingDirectory;

    // Sequential execution (no parallelization)
    for (const gen of generators) {
        for (const fix of fixtures) {
            for (const mode of outputModes) {
                // Working directory includes the output mode subdirectory
                // Structure: seed-remote-local/{generator}/{fixture}/{outputFolder}/{outputMode}/
                const testWorkingDirectory = path.join(workingDirectory, "seed-remote-local", gen, fix, outputFolder, mode);

                logger.info(`\n${"=".repeat(80)}`);
                logger.info(`Running test: ${gen} / ${fix} / ${mode}`);
                logger.info(`${"=".repeat(80)}`);

                try {
                    await runTestCase({
                        generator: gen,
                        fixture: fix,
                        outputFolder,
                        outputMode: mode,
                        context: {
                            fernExecutable,
                            fernRepoDirectory,
                            workingDirectory: testWorkingDirectory,
                            taskContext,
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

                    logger.info(`✓ Test passed: ${gen} / ${fix} / ${mode}`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    results.push({
                        generator: gen,
                        fixture: fix,
                        outputMode: mode,
                        success: false,
                        error: errorMessage
                    });

                    logger.error(`✗ Test failed: ${gen} / ${fix} / ${mode}`, error instanceof Error ? error.message : String(error));
                }
            }
        }
    }

    // Print summary
    logger.info(`\n${"=".repeat(80)}`);
    logger.info("TEST SUMMARY");
    logger.info(`${"=".repeat(80)}`);

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const total = results.length;

    logger.info(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);

    if (failed > 0) {
        logger.info("\nFailed tests:");
        for (const result of results.filter(r => !r.success)) {
            logger.error(`  ✗ ${result.generator} / ${result.fixture} / ${result.outputMode}`);
            if (result.error) {
                logger.error(`    ${result.error}`);
            }
        }
    }

    if (failed > 0) {
        throw new Error(`${failed} test(s) failed`);
    }

    logger.info("\n✓ All tests passed!");
}
