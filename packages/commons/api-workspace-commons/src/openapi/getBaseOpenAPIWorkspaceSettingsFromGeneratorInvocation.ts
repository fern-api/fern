import { generatorsYml } from "@fern-api/configuration";

import { type BaseOpenAPIWorkspace } from "./BaseOpenAPIWorkspace.js";

export function getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(
    generatorInvocation: generatorsYml.GeneratorInvocation
): Partial<BaseOpenAPIWorkspace.Settings> | undefined {
    if (
        generatorInvocation.settings == null &&
        generatorInvocation.apiOverride?.auth == null &&
        generatorInvocation.apiOverride?.["auth-schemes"] == null &&
        generatorInvocation.apiOverride?.headers == null
    ) {
        return undefined;
    }
    const result: Partial<BaseOpenAPIWorkspace.Settings> = {
        detectGlobalHeaders: true
    };

    if (generatorInvocation.settings?.unions === "v1") {
        result.discriminatedUnionV2 = true;
    }

    if (generatorInvocation.apiOverride?.auth != null) {
        result.auth = generatorInvocation.apiOverride.auth;
    }

    if (generatorInvocation.apiOverride?.["auth-schemes"] != null) {
        result.authSchemes = generatorInvocation.apiOverride["auth-schemes"];
    }

    if (generatorInvocation.apiOverride?.headers != null) {
        result.headers = generatorInvocation.apiOverride.headers;
    }

    return result;
}
