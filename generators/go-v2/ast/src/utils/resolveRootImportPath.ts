import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { generatorExec } from "@fern-api/ir-sdk";
import { basename } from "@fern-api/path-utils";
import path from "path";
import { BaseGoCustomConfigSchema } from "../custom-config/BaseGoCustomConfigSchema";

const DEFAULT_MODULE_PATH = "sdk";

export function resolveRootImportPath({
    config,
    customConfig
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema | undefined;
}): string {
    const suffix = getMajorVersionSuffix({ config });
    console.error("[DEBUG resolveRootImportPath] suffix:", suffix);
    const importPath = getImportPath({ config, customConfig });
    console.error("[DEBUG resolveRootImportPath] importPath:", importPath);
    const result = suffix != null ? maybeAppendMajorVersionSuffix({ importPath, majorVersion: suffix }) : importPath;
    console.error("[DEBUG resolveRootImportPath] final result:", result);
    return result;
}

export function resolveRootModulePath({
    config,
    customConfig
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema | undefined;
}): string {
    const suffix = getMajorVersionSuffix({ config });
    const importPath = getImportPath({ config, customConfig, isModulePath: true });
    return suffix != null ? maybeAppendMajorVersionSuffix({ importPath, majorVersion: suffix }) : importPath;
}

function getImportPath({
    config,
    customConfig,
    isModulePath = false
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema | undefined;
    isModulePath?: boolean;
}): string {
    const importPath =
        customConfig?.importPath ??
        customConfig?.module?.path ??
        (config.output.mode.type === "github"
            ? trimPrefix(config.output.mode.repoUrl, "https://")
            : DEFAULT_MODULE_PATH);
    return isModulePath ? importPath : path.join(importPath, customConfig?.packagePath ?? "");
}

function getMajorVersionSuffix({ config }: { config: FernGeneratorExec.config.GeneratorConfig }): string | undefined {
    const majorVersion = parseMajorVersion({ config });
    if (majorVersion == null || majorVersion === "v0" || majorVersion === "v1") {
        return undefined;
    }
    return `${majorVersion}`;
}

// parseMajorVersion returns the major version of the SDK, including Go's expected "v"
// prefix, e.g. "v0", "v1", "v2", etc.
function parseMajorVersion({ config }: { config: FernGeneratorExec.config.GeneratorConfig }): string | undefined {
    const version = getVersion(config);
    if (version == null) {
        return undefined;
    }
    const split = version.split(".");
    if (split[0] == null) {
        return undefined;
    }
    const majorVersion = split[0];
    if (majorVersion.startsWith("v")) {
        return majorVersion;
    }
    return `v${majorVersion}`;
}

function maybeAppendMajorVersionSuffix({
    importPath,
    majorVersion
}: {
    importPath: string;
    majorVersion: string;
}): string {
    if (basename(importPath) === majorVersion) {
        return importPath;
    }
    return `${importPath}/${majorVersion}`;
}

function trimPrefix(str: string, prefix: string): string {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length);
    }
    return str;
}

function getVersion(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    const mode = config?.output?.mode as generatorExec.OutputMode;
    const fs = require("fs");
    fs.appendFileSync("/tmp/fern-debug.log", `[DEBUG resolveRootImportPath] mode: ${JSON.stringify(mode, null, 2)}\n`);
    if (mode == null) {
        fs.appendFileSync("/tmp/fern-debug.log", "[DEBUG resolveRootImportPath] mode is null, returning undefined\n");
        return undefined;
    }
    fs.appendFileSync("/tmp/fern-debug.log", `[DEBUG resolveRootImportPath] mode.type: ${mode.type}\n`);
    if (mode.type === "github" || mode.type === "publish") {
        fs.appendFileSync(
            "/tmp/fern-debug.log",
            `[DEBUG resolveRootImportPath] Found github/publish mode, version: ${mode.version}\n`
        );
        return mode.version;
    }
    if (mode.type === "downloadFiles" && mode.version != null) {
        fs.appendFileSync(
            "/tmp/fern-debug.log",
            `[DEBUG resolveRootImportPath] Found downloadFiles mode with version: ${mode.version}\n`
        );
        return mode.version;
    }
    fs.appendFileSync("/tmp/fern-debug.log", "[DEBUG resolveRootImportPath] No version found, returning undefined\n");
    return undefined;
}
