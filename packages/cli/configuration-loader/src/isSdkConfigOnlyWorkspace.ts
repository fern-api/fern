import {
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    LEGACY_GENERATORS_CONFIGURATION_FILENAME,
    SDK_CONFIG_FILENAME
} from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";

/** Whether the API workspace is owned by `sdk-config.yml`: it has one, and no `generators.yml` of any kind. */
export async function isSdkConfigOnlyWorkspace(absolutePathToWorkspace: AbsoluteFilePath): Promise<boolean> {
    const [sdkConfigExists, generatorsYmlExists, generatorsYamlExists, legacyGeneratorsExists] = await Promise.all([
        doesPathExist(join(absolutePathToWorkspace, RelativeFilePath.of(SDK_CONFIG_FILENAME))),
        doesPathExist(join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME))),
        doesPathExist(
            join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE))
        ),
        doesPathExist(join(absolutePathToWorkspace, RelativeFilePath.of(LEGACY_GENERATORS_CONFIGURATION_FILENAME)))
    ]);
    return sdkConfigExists && !generatorsYmlExists && !generatorsYamlExists && !legacyGeneratorsExists;
}
