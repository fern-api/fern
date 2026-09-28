import { generatorsYml } from "@fern-api/configuration";

import type { AbstractAPIWorkspace } from "./AbstractAPIWorkspace.js";
import type { Spec } from "./Spec.js";

export interface SourceSpecExposingWorkspace {
    readonly exposesSourceSpecs: true;
    getSourceSpecs(): Promise<Spec[]>;
    getAllSpecsForGenerator(specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema | undefined): Promise<Spec[]>;
}

export function exposesSourceSpecs<Settings>(
    workspace: AbstractAPIWorkspace<Settings>
): workspace is AbstractAPIWorkspace<Settings> & SourceSpecExposingWorkspace {
    return "exposesSourceSpecs" in workspace && workspace.exposesSourceSpecs === true;
}
