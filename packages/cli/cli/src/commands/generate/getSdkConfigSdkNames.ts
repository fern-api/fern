import { readFile } from "node:fs/promises";
import { SDK_CONFIG_FILENAME } from "@fern-api/configuration-loader";
import { errorMessageOrString } from "@fern-api/core-utils";
import { type AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { parseSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import YAML from "yaml";

/**
 * The `sdkName` of each language's SDK in the sdk-config.yml files: the name sdk-gen-api files the build under, so the
 * docs step can find the build of an SDK from docs.yml alone. Languages are the target languages.
 */
export async function getSdkConfigSdkNames({
    directories,
    logger
}: {
    directories: AbsoluteFilePath[];
    logger: Pick<Logger, "debug">;
}): Promise<Record<string, string[]>> {
    const sdkNames: Record<string, string[]> = {};
    for (const directory of directories) {
        const path = join(directory, RelativeFilePath.of(SDK_CONFIG_FILENAME));
        if (!(await doesPathExist(path))) {
            continue;
        }
        try {
            const config = parseSdkConfigV1(YAML.parse(await readFile(path, "utf-8")));
            for (const target of config.targets) {
                const sdkName = target.sdkName ?? config.sdkName;
                const known = sdkNames[target.language] ?? [];
                sdkNames[target.language] = known.includes(sdkName) ? known : [...known, sdkName];
            }
        } catch (error) {
            logger.debug(`Could not read the SDK names from ${path}: ${errorMessageOrString(error)}`);
        }
    }
    return sdkNames;
}
