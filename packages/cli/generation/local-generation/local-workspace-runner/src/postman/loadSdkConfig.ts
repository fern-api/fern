import { AbsoluteFilePath, basename, dirname } from "@fern-api/fs-utils";
import { findReadableSdkConfigFile } from "@fern-api/project-structure";
import type { SdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { parseSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

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
 * `fern sdk migrate` writes that file beside `fern.config.json`. `generators.yml` is not replaced in place: the
 * migration renames it to the centrally configured legacy filename and comments migrated declarations for rollback.
 * A workspace mid-migration therefore has both active legacy generators and SDK Config targets.
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
    const absolutePath = await findReadableSdkConfigFile(dirname(absolutePathToFernConfig));
    if (absolutePath == null) {
        return { type: "absent" };
    }
    const filename = basename(absolutePath);

    let document: unknown;
    try {
        document = yaml.load(await readFile(absolutePath, "utf8"));
    } catch (error) {
        return { type: "invalid", absolutePath, message: `${filename} is not valid YAML: ${errorMessage(error)}` };
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

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
