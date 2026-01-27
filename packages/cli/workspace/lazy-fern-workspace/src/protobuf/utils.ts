import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { runExeca } from "@fern-api/logging-execa";
import { access, cp, rm } from "fs/promises";
import tmp from "tmp-promise";

/**
 * Check if an error message indicates a network error.
 * Used by both protobuf generation and AI example enhancement for air-gap detection.
 */
export function isNetworkError(errorMessage: string): boolean {
    return (
        errorMessage.includes("server hosted at that remote is unavailable") ||
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("failed to connect") ||
        errorMessage.includes("network") ||
        errorMessage.includes("ENOTFOUND") ||
        errorMessage.includes("ETIMEDOUT") ||
        errorMessage.includes("TIMEDOUT") ||
        errorMessage.includes("timed out") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ECONNRESET") ||
        errorMessage.includes("socket hang up")
    );
}

// Global cache for air-gap detection result
let airGapDetectionResult: boolean | undefined;
let airGapDetectionPromise: Promise<boolean> | undefined;

/**
 * Detect if we're in an air-gapped environment by trying to reach a URL via HTTP.
 * The result is cached globally to avoid repeated detection attempts.
 * Used by both protobuf generation and AI example enhancement.
 */
export async function detectAirGappedMode(url: string, logger: Logger, timeoutMs: number = 5000): Promise<boolean> {
    if (airGapDetectionResult !== undefined) {
        return airGapDetectionResult;
    }

    if (airGapDetectionPromise == null) {
        airGapDetectionPromise = performAirGapDetection(url, logger, timeoutMs);
    }

    return airGapDetectionPromise;
}

async function performAirGapDetection(url: string, logger: Logger, timeoutMs: number): Promise<boolean> {
    logger.debug(`Checking air-gapped mode: ${url} (timeout: ${timeoutMs}ms)`);

    try {
        await fetch(url, {
            method: "GET",
            signal: AbortSignal.timeout(timeoutMs)
        });

        airGapDetectionResult = false;
        logger.debug(`Air-gap detection result (${url}): connected`);
        return false;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (isNetworkError(errorMessage)) {
            airGapDetectionResult = true;
            logger.debug(`Air-gap detection result (${url}): air-gapped (${errorMessage})`);
            return true;
        }
        airGapDetectionResult = false;
        logger.debug(`Air-gap detection result (${url}): connected (non-network error: ${errorMessage})`);
        return false;
    }
}

/**
 * Detect if we're in an air-gapped environment for protobuf generation.
 * Uses buf dep update to check network availability.
 * Returns true if air-gapped (network unavailable), false otherwise.
 */
export async function detectAirGappedModeForProtobuf(
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

    // Try a network check with buf dep update using a 30-second timeout
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
        // Cleanup temp dir and its contents
        try {
            await rm(tmpDir, { recursive: true, force: true });
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
