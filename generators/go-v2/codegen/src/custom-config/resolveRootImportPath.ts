import { FernGeneratorExec, getSdkVersion } from "@fern-api/generator-commons";
import path from "path";
import { BaseGoCustomConfigSchema } from "./BaseGoCustomConfigSchema";

const DEFAULT_MODULE_PATH = "sdk";

export function resolveRootImportPath({
    config,
    customConfig
}: {
    config: FernGeneratorExec.config.GeneratorConfig;
    customConfig: BaseGoCustomConfigSchema;
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
    customConfig: BaseGoCustomConfigSchema;
}): string {
    return (
        customConfig.importPath ??
        customConfig.module?.path ??
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

function parseMajorVersion({ config }: { config: FernGeneratorExec.config.GeneratorConfig }): string | undefined {
    const version = getSdkVersion(config);
    if (version == null) {
        return undefined;
    }
    const split = version.split(".");
    if (split[0] == null) {
        return undefined;
    }
    return split[0];
}

function maybeAppendMajorVersionSuffix({
    importPath,
    majorVersion
}: {
    importPath: string;
    majorVersion: string;
}): string {
    if (path.basename(importPath) === majorVersion) {
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
