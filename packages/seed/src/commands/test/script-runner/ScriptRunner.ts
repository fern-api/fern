import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces.js";
import { Semaphore } from "../../../Semaphore.js";

export declare namespace ScriptRunner {
    interface RunArgs {
        taskContext: TaskContext;
        outputDir: AbsoluteFilePath;
        id: string;
        skipScripts?: boolean | string[];
    }

    type RunResponse = ScriptSuccessResponse | ScriptFailureResponse;

    interface ScriptSuccessResponse {
        type: "success";
        buildTimeMs?: number;
        testTimeMs?: number;
    }

    interface ScriptFailureResponse {
        type: "failure";
        phase: "build" | "test";
        message: string;
        buildTimeMs?: number;
        testTimeMs?: number;
    }
}

/**
 * Abstract base class for running scripts on generated code to verify the output.
 */
export abstract class ScriptRunner {
    protected readonly lock = new Semaphore(1);

    constructor(
        protected readonly workspace: GeneratorWorkspace,
        protected readonly skipScripts: boolean,
        protected readonly context: TaskContext,
        protected readonly logLevel: LogLevel
    ) {}

    public abstract run({ taskContext, id, outputDir }: ScriptRunner.RunArgs): Promise<ScriptRunner.RunResponse>;
    public abstract stop(): Promise<void>;

    protected abstract initialize(): Promise<void>;

    protected shouldStreamOutput(): boolean {
        return this.logLevel === "debug" || this.logLevel === "trace";
    }

    /**
     * Rewrites _PROJECT_NAME in tests/conftest.py to include a unique suffix derived from the
     * fixture id (e.g. "exhaustive:no-custom-config" -> "seed-exhaustive-no-custom-config").
     * This prevents Docker Compose naming collisions when multiple fixture variants of the
     * same API run wiremock containers in parallel during bulk seed tests.
     *
     * Returns the original file content and path so it can be restored after tests complete,
     * ensuring the committed seed output remains unchanged.
     */
    protected async rewriteComposeProjectName(
        outputDir: AbsoluteFilePath,
        id: string,
        taskContext: TaskContext
    ): Promise<{ filePath: string; originalContent: string } | undefined> {
        const conftestPath = path.join(outputDir, "tests", "conftest.py");
        try {
            const originalContent = await readFile(conftestPath, "utf-8");
            const projectNameMatch = originalContent.match(/^_PROJECT_NAME:\s*str\s*=\s*"([^"]+)"/m);
            if (projectNameMatch == null) {
                return undefined;
            }

            // Derive a unique project name from the fixture id.
            // e.g. "exhaustive:no-custom-config" -> "seed-exhaustive-no-custom-config"
            const uniqueSuffix = id
                .replace(/:/g, "-")
                .replace(/[^a-z0-9_-]/gi, "")
                .toLowerCase();
            const uniqueProjectName = `seed-${uniqueSuffix}`;

            if (uniqueProjectName === projectNameMatch[1]) {
                // Already unique, no rewrite needed
                return undefined;
            }

            const rewritten = originalContent.replace(
                /^(_PROJECT_NAME:\s*str\s*=\s*")([^"]+)(")/m,
                `$1${uniqueProjectName}$3`
            );
            await writeFile(conftestPath, rewritten);
            taskContext.logger.debug(
                `Rewrote _PROJECT_NAME in ${conftestPath}: "${projectNameMatch[1]}" -> "${uniqueProjectName}"`
            );
            return { filePath: conftestPath, originalContent };
        } catch {
            // conftest.py doesn't exist or isn't readable - not a wiremock test, skip silently
            return undefined;
        }
    }

    /**
     * Restores the original conftest.py content after tests complete so that the
     * committed seed output is not modified by the seed test runner.
     */
    protected async restoreConftestFile(
        backup: { filePath: string; originalContent: string } | undefined,
        taskContext: TaskContext
    ): Promise<void> {
        if (backup == null) {
            return;
        }
        try {
            await writeFile(backup.filePath, backup.originalContent);
            taskContext.logger.debug(`Restored original conftest.py at ${backup.filePath}`);
        } catch (e) {
            taskContext.logger.warn(`Failed to restore conftest.py at ${backup.filePath}: ${e}`);
        }
    }
}
