import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";

/**
 * Settings specific to IR generation.
 * These are configuration options that only apply during IR generation.
 */
export interface IRGenerationSettings {
    pathParameterOrder: generatorsYml.PathParameterOrder;
}

/**
 * Default values for IR generation settings.
 */
const IR_GENERATION_DEFAULTS: IRGenerationSettings = {
    pathParameterOrder: generatorsYml.PathParameterOrder.UrlOrder
};

/**
 * Extracts IR generation settings from the workspace configuration and applies defaults
 * for any undefined settings values.
 *
 * @param workspace - The Fern workspace containing the generators configuration
 * @returns Complete IR generation settings with all defaults applied
 */
export function getIrGenerationSettings({
    workspace,
}: {
    workspace: FernWorkspace;
}): IRGenerationSettings {
    const apiSettings = workspace.generatorsConfiguration?.api?.settings;
    const result = { ...IR_GENERATION_DEFAULTS };

    for (const key of Object.keys(IR_GENERATION_DEFAULTS) as Array<keyof IRGenerationSettings>) {
        const userValue = apiSettings?.[key];
        if (userValue !== undefined) {
            result[key] = userValue;
        }
    }

    return result;
}
