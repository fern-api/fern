import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { basename } from "@fern-api/path-utils";

import { BaseGoCustomConfigSchema } from "./BaseGoCustomConfigSchema";

const DEFAULT_MODULE_PATH = "sdk";

export function resolveRootImportPath({
    config,
    customConfig
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema | undefined;
}): string {
    const suffix = getMajorVersionSuffix({ config });
    const importPath = getImportPath({ config, customConfig });
    return suffix != null ? maybeAppendMajorVersionSuffix({ importPath, majorVersion: suffix }) : importPath;
}

function getImportPath({
    config,
    customConfig
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema | undefined;
}): string {
    return (
        customConfig?.importPath ??
        customConfig?.module?.path ??
        (config.output.mode.type === "github"
            ? trimPrefix(config.output.mode.repoUrl, "https://")
            : DEFAULT_MODULE_PATH)
    );
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
    const mode = config?.output?.mode;
    if (mode == null) {
        return undefined;
    }
    return mode.type === "github" || mode.type === "publish" ? mode.version : undefined;
}
