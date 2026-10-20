import {
    DEFINITION_DIRECTORY,
    DOCS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    LEGACY_GENERATORS_CONFIGURATION_FILENAME,
    ROOT_API_FILENAME,
    SDK_CONFIG_FILENAME,
    SDK_CONFIG_FILENAME_ALTERNATIVE
} from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";

import { existsIn } from "../utils.js";

export type ActiveGeneratorsFileName =
    | typeof GENERATORS_CONFIGURATION_FILENAME
    | typeof GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE;

export type GeneratorsFileName = ActiveGeneratorsFileName | typeof LEGACY_GENERATORS_CONFIGURATION_FILENAME;

/** The generators file that is in effect in a directory. */
export type GeneratorsFile =
    | { type: "none" }
    | { type: "found"; path: AbsoluteFilePath; name: GeneratorsFileName }
    /** An active file (`generators.yml` or `generators.yaml`) sits next to `generators.legacy.yml`. */
    | { type: "conflict"; activeName: ActiveGeneratorsFileName };

/** `generators.yml`, then `generators.yaml`, then `generators.legacy.yml`. An active file beside the legacy one is a conflict. */
export async function findGeneratorsFile(directory: AbsoluteFilePath): Promise<GeneratorsFile> {
    const [ymlExists, yamlExists, legacyExists] = await Promise.all([
        existsIn(directory, GENERATORS_CONFIGURATION_FILENAME),
        existsIn(directory, GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE),
        existsIn(directory, LEGACY_GENERATORS_CONFIGURATION_FILENAME)
    ]);
    if ((ymlExists || yamlExists) && legacyExists) {
        return {
            type: "conflict",
            activeName: ymlExists ? GENERATORS_CONFIGURATION_FILENAME : GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE
        };
    }
    if (ymlExists) {
        return found(directory, GENERATORS_CONFIGURATION_FILENAME);
    }
    if (yamlExists) {
        return found(directory, GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE);
    }
    if (legacyExists) {
        return found(directory, LEGACY_GENERATORS_CONFIGURATION_FILENAME);
    }
    return { type: "none" };
}

/** Where `sdk-config.yml` lives in a directory, whether or not it exists. */
export function sdkConfigFilePath(directory: AbsoluteFilePath): AbsoluteFilePath {
    return join(directory, RelativeFilePath.of(SDK_CONFIG_FILENAME));
}

/** `sdk-config.yml`. This is the only name project discovery and the commands recognize. */
export async function findSdkConfigFile(directory: AbsoluteFilePath): Promise<AbsoluteFilePath | undefined> {
    const sdkConfigFile = sdkConfigFilePath(directory);
    return (await doesPathExist(sdkConfigFile)) ? sdkConfigFile : undefined;
}

/** `sdk-config.yml`, then `sdk-config.yaml`. Only the local generation runner reads the `.yaml` spelling. */
export async function findReadableSdkConfigFile(directory: AbsoluteFilePath): Promise<AbsoluteFilePath | undefined> {
    return await findFirstExisting(directory, [SDK_CONFIG_FILENAME, SDK_CONFIG_FILENAME_ALTERNATIVE], "file");
}

/** Where `docs.yml` lives in a directory, whether or not it exists. */
export function docsConfigFilePath(directory: AbsoluteFilePath): AbsoluteFilePath {
    return join(directory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
}

/** `docs.yml`. There is no `.yaml` spelling. */
export async function findDocsConfigFile(directory: AbsoluteFilePath): Promise<AbsoluteFilePath | undefined> {
    const docsConfigFile = docsConfigFilePath(directory);
    return (await doesPathExist(docsConfigFile)) ? docsConfigFile : undefined;
}

/** Where `definition/api.yml`, the root file of a Fern definition, lives in a workspace, whether or not it exists. */
export function rootApiFilePath(workspaceDirectory: AbsoluteFilePath): AbsoluteFilePath {
    return join(workspaceDirectory, RelativeFilePath.of(DEFINITION_DIRECTORY), RelativeFilePath.of(ROOT_API_FILENAME));
}

function found(directory: AbsoluteFilePath, name: GeneratorsFileName): GeneratorsFile {
    return { type: "found", path: join(directory, RelativeFilePath.of(name)), name };
}

async function findFirstExisting(
    directory: AbsoluteFilePath,
    names: readonly string[],
    mode?: "file" | "directory"
): Promise<AbsoluteFilePath | undefined> {
    for (const name of names) {
        const candidate = join(directory, RelativeFilePath.of(name));
        if (await doesPathExist(candidate, mode)) {
            return candidate;
        }
    }
    return undefined;
}
