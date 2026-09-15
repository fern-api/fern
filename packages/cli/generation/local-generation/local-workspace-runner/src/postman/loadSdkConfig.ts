import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { SdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { parseSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

/**
 * The migrated external configuration, written by `fern sdk migrate` beside `fern.config.json`.
 *
 * `generators.yml` is not replaced in place: the migration archives it as `generators.archived.yml`
 * and lands this file next to it, so a workspace mid-migration has both on disk and the presence of
 * this one is what selects the new configuration.
 */
export const SDK_CONFIG_FILENAME = "sdk-config.yml";

/** `.yaml` is accepted on read only. The migration writes `.yml`, matching every other Fern file. */
const SDK_CONFIG_FILENAMES: readonly string[] = [SDK_CONFIG_FILENAME, "sdk-config.yaml"];

export declare namespace loadSdkConfig {
    interface Args {
        /** Path to `fern.config.json`; its directory is the Fern configuration directory. */
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
    }

    type Result =
        | { type: "absent" }
        | { type: "loaded"; sdkConfig: SdkConfigV1; absolutePath: AbsoluteFilePath }
        | { type: "invalid"; absolutePath: AbsoluteFilePath; message: string };
}

/**
 * Reads `sdk-config.yml` from the Fern configuration directory, if the workspace has been migrated.
 *
 * Absence is a result rather than an error because it is the ordinary state of an unmigrated
 * workspace: the caller decides whether falling back to `generators.yml` is allowed, which depends
 * on which generator is being run rather than on anything visible here.
 *
 * Defaults are materialized with `parseSdkConfigV1` rather than preserved with `validateSdkConfigV1`.
 * The document is being carried into a runtime boundary, not rewritten to disk, so the values the
 * generator sees should be the resolved ones.
 */
export async function loadSdkConfig({ absolutePathToFernConfig }: loadSdkConfig.Args): Promise<loadSdkConfig.Result> {
    if (absolutePathToFernConfig == null) {
        return { type: "absent" };
    }
    const fernDirectory = dirname(absolutePathToFernConfig);

    for (const filename of SDK_CONFIG_FILENAMES) {
        const absolutePath = join(fernDirectory, RelativeFilePath.of(filename));
        if (!(await doesPathExist(absolutePath, "file"))) {
            continue;
        }

        let document: unknown;
        try {
            document = yaml.load(await readFile(absolutePath, "utf8"));
        } catch (error) {
            return {
                type: "invalid",
                absolutePath,
                message: `${filename} is not valid YAML: ${errorMessage(error)}`
            };
        }

        try {
            return { type: "loaded", sdkConfig: parseSdkConfigV1(document), absolutePath };
        } catch (error) {
            return {
                type: "invalid",
                absolutePath,
                message: `${filename} is not a valid SDK Config: ${errorMessage(error)}`
            };
        }
    }

    return { type: "absent" };
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
