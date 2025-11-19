import { Logger, LogLevel } from "@fern-api/logger";
import { runExeca } from "@fern-api/logging-execa";
import path from "path";
import readline from "readline";
import {
    ENV_VAR_FERN_TOKEN,
    ENV_VAR_GITHUB_TOKEN,
    FERN_GENERATE_COMMAND,
    FERN_TEST_REPO_NAME,
    FLAG_GROUP,
    FLAG_LOCAL,
    FLAG_LOG_LEVEL,
    GenerationMode,
    LOCAL_GROUP_NAME,
    MSG_GENERATION_COMPLETED_PREFIX,
    MSG_GENERATION_FAILED_PREFIX,
    MSG_GENERATION_RUNNING_PREFIX,
    REMOTE_GROUP_NAME,
    SDKS_DIRECTORY_NAME
} from "./constants";
import { copyGithubOutputToOutputDirectory } from "./githubIntegration";
import type { GenerationResult, RemoteVsLocalTestCase } from "./types";

/**
 * Creates a logger wrapper that parses log level prefixes from output lines
 * and calls the appropriate logging method on the underlying logger.
 *
 * Patterns matched:
 * - "DEBUG ..." -> logger.debug()
 * - "INFO ..." -> logger.info()
 * - "WARN ..." -> logger.warn()
 * - "ERROR ..." -> logger.error()
 * - "TRACE ..." -> logger.trace()
 */
function createPrefixParsingLogger(logger: Logger): Logger {
    const LOG_LEVEL_PATTERN = /^(DEBUG|INFO|WARN|ERROR|TRACE)\s+(.*)$/;

    function parseAndLog(message: string): void {
        const match = message.match(LOG_LEVEL_PATTERN);
        if (match && match[1] && match[2]) {
            const level = match[1];
            const content = match[2];
            switch (level) {
                case "DEBUG":
                    logger.debug(content);
                    break;
                case "INFO":
                    logger.info(content);
                    break;
                case "WARN":
                    logger.warn(content);
                    break;
                case "ERROR":
                    logger.error(content);
                    break;
                case "TRACE":
                    logger.trace(content);
                    break;
            }
        } else {
            // No prefix found, log as-is using debug level
            logger.debug(message);
        }
    }

    return {
        disable: () => logger.disable(),
        enable: () => logger.enable(),
        trace: (...args: string[]) => args.forEach(parseAndLog),
        debug: (...args: string[]) => args.forEach(parseAndLog),
        info: (...args: string[]) => args.forEach(parseAndLog),
        warn: (...args: string[]) => args.forEach(parseAndLog),
        error: (...args: string[]) => args.forEach(parseAndLog),
        log: (_level: LogLevel, ...args: string[]) => args.forEach(parseAndLog)
    };
}

export async function runGeneration(
    testCase: RemoteVsLocalTestCase,
    generationMode: GenerationMode
): Promise<GenerationResult> {
    const { outputMode } = testCase;
    const { fernExecutable, workingDirectory, logger, githubToken, fernToken } = testCase.context;
    const group = generationMode === "local" ? LOCAL_GROUP_NAME : REMOTE_GROUP_NAME;
    const extraFlags = generationMode === "local" ? [FLAG_LOCAL] : [];

    // Use debug level to capture all output (needed for extracting branch info)
    // but we won't forward all logs to stdout - only our own structured logs
    const args = [FERN_GENERATE_COMMAND, FLAG_GROUP, group, FLAG_LOG_LEVEL, LogLevel.Debug, ...extraFlags];

    logger.info(`${MSG_GENERATION_RUNNING_PREFIX} ${generationMode} generation...`);
    logger.debug(`  Command: ${fernExecutable} ${args.join(" ")}`);
    logger.debug(`  Working directory: ${workingDirectory}`);

    const startTime = Date.now();

    try {
        // Wrap logger to parse log level prefixes from CLI output
        const prefixParsingLogger = createPrefixParsingLogger(logger);

        // Run the command with execa but don't pipe output directly
        const command = runExeca(logger, fernExecutable, args, {
            cwd: workingDirectory,
            env: {
                [ENV_VAR_GITHUB_TOKEN]: githubToken,
                [ENV_VAR_FERN_TOKEN]: fernToken,
                ["FERN_NO_VERSION_REDIRECTION"]: "true"
            },
            reject: false,
            all: true
        });

        // Process stdout line-by-line using the prefix-parsing logger
        if (command.stdout) {
            const stdoutReader = readline.createInterface({ input: command.stdout });
            stdoutReader.on("line", (line) => {
                prefixParsingLogger.debug(line);
            });
        }

        // Process stderr line-by-line using the prefix-parsing logger
        if (command.stderr) {
            const stderrReader = readline.createInterface({ input: command.stderr });
            stderrReader.on("line", (line) => {
                prefixParsingLogger.error(line);
            });
        }

        const result = await command;

        const duration = Date.now() - startTime;

        if (result.exitCode !== 0) {
            logger.error(
                `${MSG_GENERATION_FAILED_PREFIX} ${generationMode} generation failed after ${duration}ms (exit code: ${result.exitCode})`
            );
            logger.debug(`Result: ${JSON.stringify(result, null, 2)}`);

            // Show error output from the subprocess
            if (result.stderr) {
                logger.error(`  Error output:`);
                result.stderr.split("\n").forEach((line: string) => {
                    if (line.trim()) {
                        logger.error(`    ${line}`);
                    }
                });
            }

            return { success: false, error: result.stderr || "Unknown error" };
        }

        logger.info(`${MSG_GENERATION_COMPLETED_PREFIX} ${generationMode} generation completed in ${duration}ms`);

        const outputDirectory = getOutputDirectory(testCase, generationMode);
        if (outputMode === "github") {
            logger.debug(`  Copying GitHub output to ${outputDirectory}`);
            // Pass the combined output (stdout + stderr) to extract branch info
            await copyGithubOutputToOutputDirectory(
                FERN_TEST_REPO_NAME,
                result.all || result.stdout,
                outputDirectory,
                logger,
                githubToken
            );
        }

        return { success: true, outputFolder: outputDirectory };
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`✗ ${generationMode} generation failed after ${duration}ms`);
        logger.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export function getOutputDirectory(testCase: RemoteVsLocalTestCase, generationMode: GenerationMode): string {
    const { generator } = testCase;
    const { workingDirectory } = testCase.context;

    // Structure: {workingDirectory}/sdks/{generationMode}/{generator}
    // Example: seed-remote-local/python-sdk/imdb/no-custom-config/local-file-system/sdks/local/python-sdk
    return path.join(workingDirectory, SDKS_DIRECTORY_NAME, generationMode + "Generation");
}
