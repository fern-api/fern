import { generatorsYml } from "@fern-api/configuration";

import type { AbstractAPIWorkspace } from "./AbstractAPIWorkspace.js";
import type { Spec } from "./Spec.js";

export interface SourceSpecExposingWorkspace {
    getSourceSpecs(): Promise<Spec[]>;
    getAllSpecsForGenerator(specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema | undefined): Promise<Spec[]>;
}

export function exposesSourceSpecs<Settings>(
    workspace: AbstractAPIWorkspace<Settings>
): workspace is AbstractAPIWorkspace<Settings> & SourceSpecExposingWorkspace {
    return (
        "getSourceSpecs" in workspace &&
        typeof workspace.getSourceSpecs === "function" &&
        "getAllSpecsForGenerator" in workspace &&
        typeof workspace.getAllSpecsForGenerator === "function"
    );
}
