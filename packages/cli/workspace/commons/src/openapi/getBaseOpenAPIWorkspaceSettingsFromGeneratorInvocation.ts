import { generatorsYml } from "@fern-api/configuration";

import { type BaseOpenAPIWorkspace } from "./BaseOpenAPIWorkspace";

export function getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(
    generatorInvocation: generatorsYml.GeneratorInvocation
): Partial<BaseOpenAPIWorkspace.Settings> | undefined {
    if (generatorInvocation.settings == null) {
        return undefined;
    }
    const result: Partial<BaseOpenAPIWorkspace.Settings> = {
        detectGlobalHeaders: true
    };
    if (generatorInvocation.settings.unions === "v1") {
        result.discriminatedUnionV2 = true;
    }

    return result;
}
