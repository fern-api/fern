import { isCodingAgent } from "@fern-api/fs-utils";
import { Logger, LogLevel } from "@fern-api/logger";
import { CliError, InstructionsTopic, TaskAbortSignal } from "@fern-api/task-context";
import chalk from "chalk";

const USE_NODE_18_OR_ABOVE_MESSAGE = "The Fern CLI requires Node 18+ or above.";

export function logErrorMessage({
    message,
    error,
    logger,
    logLevel = LogLevel.Error,
    instructionsTopic
}: {
    message: string | undefined;
    error: unknown;
    logger: Logger;
    logLevel?: LogLevel;
    /** Overrides the error's own `CliError.instructionsTopic`. Each topic gets its own hint line. */
    instructionsTopic?: InstructionsTopic | readonly InstructionsTopic[];
}): void {
    const topics = toTopicList(instructionsTopic ?? (error instanceof CliError ? error.instructionsTopic : undefined));

    if (message != null) {
        logger.log(logLevel, message);
    } else if (error == null) {
        // e.g. `fern check`, which has already printed its report and only adds hints here
        logInstructionsHints({ topics, logger, logLevel });
        return;
    }

    // thrower is responsible for logging, so we don't need to log the error's message too
    if (error instanceof TaskAbortSignal) {
        return;
    }

    if (error != null) {
        const errorMessage = convertErrorToString(error);
        if (errorMessage != null) {
            logger.log(logLevel, errorMessage);
        }
    }

    logInstructionsHints({ topics, logger, logLevel });

    const stack = error instanceof Error ? error.stack : new Error(JSON.stringify(error)).stack;
    if (stack != null) {
        logger.debug(chalk.red(stack));
    }
}

function toTopicList(topic: InstructionsTopic | readonly InstructionsTopic[] | undefined): InstructionsTopic[] {
    if (topic == null) {
        return [];
    }
    return isTopicList(topic) ? [...new Set(topic)] : [topic];
}

function isTopicList(topic: InstructionsTopic | readonly InstructionsTopic[]): topic is readonly InstructionsTopic[] {
    return Array.isArray(topic);
}

function logInstructionsHints({
    topics,
    logger,
    logLevel
}: {
    topics: InstructionsTopic[];
    logger: Logger;
    logLevel: LogLevel;
}): void {
    if (topics.length === 0 || !isCodingAgent()) {
        return;
    }
    for (const topic of topics) {
        logger.log(logLevel, getInstructionsHint(topic));
    }
}

function getInstructionsHint(topic: InstructionsTopic): string {
    const command = topic === InstructionsTopic.Index ? "fern instructions" : `fern instructions ${topic}`;
    return `For guidance, run \`${command}\`.`;
}

function convertErrorToString(error: unknown): string | undefined {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        if ((error as Error)?.message?.includes("globalThis")) {
            return USE_NODE_18_OR_ABOVE_MESSAGE;
        }

        return error.message;
    }
    return undefined;
}
