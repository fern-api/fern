import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { runExeca } from "@fern-api/logging-execa";
import { access, cp, unlink } from "fs/promises";
import tmp from "tmp-promise";

/**
 * Check if an error message indicates a network error.
 */
export function isNetworkError(errorMessage: string): boolean {
    return (
        errorMessage.includes("server hosted at that remote is unavailable") ||
        errorMessage.includes("failed to connect") ||
        errorMessage.includes("network") ||
        errorMessage.includes("ENOTFOUND") ||
        errorMessage.includes("ETIMEDOUT") ||
        errorMessage.includes("TIMEDOUT") ||
        errorMessage.includes("timed out")
    );
}

/**
 * Detect if we're in an air-gapped environment by trying buf dep update once.
 * Returns true if air-gapped (network unavailable), false otherwise.
 */
export async function detectAirGappedMode(
    absoluteFilepathToProtobufRoot: AbsoluteFilePath,
    logger: Logger
): Promise<boolean> {
    const bufLockPath = join(absoluteFilepathToProtobufRoot, RelativeFilePath.of("buf.lock"));

    // Check if buf.lock exists (required for air-gapped mode)
    let bufLockExists = false;
    try {
        await access(bufLockPath);
        bufLockExists = true;
        logger.debug(`Found buf.lock at: ${bufLockPath}`);
    } catch {
        logger.debug(`No buf.lock found at: ${bufLockPath}`);
    }

    if (!bufLockExists) {
        // No buf.lock means we need network access - not air-gapped
        return false;
    }

    // Try a quick network check with buf dep update using a short timeout
    const tmpDir = AbsoluteFilePath.of((await tmp.dir()).path);
    try {
        // Copy buf.yaml and buf.lock to temp dir for the test
        const bufYamlPath = join(absoluteFilepathToProtobufRoot, RelativeFilePath.of("buf.yaml"));
        try {
            await cp(bufYamlPath, join(tmpDir, RelativeFilePath.of("buf.yaml")));
            await cp(bufLockPath, join(tmpDir, RelativeFilePath.of("buf.lock")));
        } catch {
            // If we can't copy the files, assume not air-gapped
            return false;
        }

        // Try buf dep update with a timeout (30 seconds)
        try {
            await runExeca(logger, "buf", ["dep", "update"], {
                cwd: tmpDir,
                stdio: "pipe",
                timeout: 30000 // 30 second timeout for detection
            });
            // Network works - not air-gapped
            logger.debug("Network check succeeded - not in air-gapped mode");
            return false;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (isNetworkError(errorMessage)) {
                logger.debug(`Network check failed - entering air-gapped mode: ${errorMessage.substring(0, 100)}`);
                return true;
            }
            // Non-network error - assume not air-gapped
            return false;
        }
    } finally {
        // Cleanup temp dir
        try {
            await unlink(join(tmpDir, RelativeFilePath.of("buf.yaml")));
            await unlink(join(tmpDir, RelativeFilePath.of("buf.lock")));
        } catch {
            // Ignore cleanup errors
        }
    }
}

export const PROTOBUF_GENERATOR_CONFIG_FILENAME = "buf.gen.yaml";
export const PROTOBUF_GENERATOR_OUTPUT_PATH = "output";
export const PROTOBUF_GENERATOR_OUTPUT_FILEPATH = `${PROTOBUF_GENERATOR_OUTPUT_PATH}/ir.json`;
export const PROTOBUF_SHELL_PROXY_FILENAME = "protoc-gen-fern";
export const PROTOBUF_EXPORT_CONFIG_V1 = `version: v1
`;
export const PROTOBUF_EXPORT_CONFIG_V2 = `version: v2
`;
export const getProtobufYamlV1 = (deps: string[]): string => {
    let yaml = `version: v1\n`;
    if (deps.length > 0) {
        yaml += `deps:\n`;
        for (const dep of deps) {
            yaml += `  - ${dep}\n`;
        }
    }
    return yaml;
};

export const getProtobufYamlV2 = (deps: string[]): string => {
    let yaml = `version: v2\n`;
    if (deps.length > 0) {
        yaml += `deps:\n`;
        for (const dep of deps) {
            yaml += `  - ${dep}\n`;
        }
    }
    return yaml;
};
export const PROTOBUF_GEN_CONFIG = `version: v2
plugins:
  - local: ["bash", "./protoc-gen-fern"]
    out: output
    strategy: all
    include_imports: true
    include_wkt: true
`;

export const PROTOBUF_MODULE_PACKAGE_JSON = `{
    "name": "temp-protoc-gen-fern",
    "version": "1.0.0",
    "type": "module",
    "dependencies": {
        "@bufbuild/protobuf": "^2.2.5",
        "@bufbuild/protoplugin": "2.2.5"
    }
}
`;

export const PROTOBUF_SHELL_PROXY = `#!/usr/bin/env bash
fern protoc-gen-fern "$@"
`;

export const createEmptyProtobufLogger = (): Logger => {
    return {
        // biome-ignore-start lint/suspicious/noEmptyBlockStatements: allow
        disable: () => {},
        enable: () => {},
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        log: () => {}
        // biome-ignore-end lint/suspicious/noEmptyBlockStatements: allow
    };
};

export type MaybeValid<T> = Valid<T> | Invalid;

export interface Valid<T> {
    ok: true;
    value: T;
}

export interface Invalid {
    ok: false;
    errors: ValidationError[];
}

export interface ValidationError {
    path: string[];
    message: string;
}
