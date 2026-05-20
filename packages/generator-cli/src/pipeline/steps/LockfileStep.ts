import { extractErrorMessage } from "@fern-api/core-utils";
import { execFile as execFileCb } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import type { LockfileStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

const execFile = promisify(execFileCb);

/**
 * Generates a package-manager lockfile (pnpm-lock.yaml or yarn.lock) for the
 * SDK output directory.
 *
 * Placed after ReplayStep (and FernignoreStep, once implemented) so the
 * lockfile reflects the final package.json state after all customization
 * patches have been applied. No-ops when the output directory does not
 * contain a package.json (non-JS/TS generators).
 */
export class LockfileStep extends BaseStep {
    readonly name = "lockfile";

    async execute(_context: PipelineContext): Promise<LockfileStepResult> {
        const packageJsonPath = join(this.outputDir, "package.json");
        if (!existsSync(packageJsonPath)) {
            return { executed: true, success: true, skipped: true };
        }

        const packageManager = this.detectPackageManager();

        this.logger.info(`Generating ${packageManager} lockfile...`);
        const startTime = Date.now();

        try {
            const args =
                packageManager === "yarn"
                    ? ["install", "--mode=update-lockfile", "--ignore-scripts", "--prefer-offline"]
                    : ["install", "--lockfile-only", "--ignore-scripts", "--prefer-offline"];

            const env: Record<string, string | undefined> =
                packageManager === "yarn"
                    ? { ...process.env, YARN_ENABLE_IMMUTABLE_INSTALLS: "false" }
                    : { ...process.env, PNPM_FROZEN_LOCKFILE: "false" };

            await execFile(packageManager, args, { cwd: this.outputDir, env });

            const durationMs = Date.now() - startTime;
            this.logger.info(`Lockfile generated in ${durationMs}ms.`);
            return { executed: true, success: true, skipped: false, packageManager };
        } catch (error) {
            const durationMs = Date.now() - startTime;
            const errorMessage = extractErrorMessage(error);
            this.logger.warn(`Lockfile generation failed after ${durationMs}ms: ${errorMessage}`);
            return {
                executed: true,
                success: true,
                skipped: false,
                packageManager,
                errorMessage
            };
        }
    }

    /**
     * Detects the package manager from files in the output directory.
     * Checks for .yarnrc.yml (yarn) and falls back to checking the
     * packageManager field in package.json. Defaults to pnpm.
     */
    private detectPackageManager(): "pnpm" | "yarn" {
        if (existsSync(join(this.outputDir, ".yarnrc.yml"))) {
            return "yarn";
        }
        try {
            const content = readFileSync(join(this.outputDir, "package.json"), "utf-8");
            const parsed: unknown = JSON.parse(content);
            if (isPackageJson(parsed) && typeof parsed.packageManager === "string") {
                if (parsed.packageManager.startsWith("yarn")) {
                    return "yarn";
                }
            }
        } catch {
            // ignore parse errors
        }
        return "pnpm";
    }
}

function isPackageJson(value: unknown): value is { packageManager?: unknown } {
    return value != null && typeof value === "object" && !Array.isArray(value);
}
