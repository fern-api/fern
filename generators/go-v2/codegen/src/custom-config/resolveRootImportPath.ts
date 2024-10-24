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
    const importPath = customConfig.importPath ?? customConfig.module?.path ?? DEFAULT_MODULE_PATH;
    return suffix != null ? maybeAppendMajorVersionSuffix({ importPath, majorVersion: suffix }) : importPath;
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
