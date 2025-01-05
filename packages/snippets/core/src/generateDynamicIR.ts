import { Audiences, generatorsYml } from "@fern-api/configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { dynamic } from "@fern-api/ir-sdk";
import { NopSourceResolver } from "@fern-api/source-resolver";

import { Spec } from "./Spec";
import { convertSpecToWorkspace } from "./utils/convertSpecToWorkspace";
import { createTaskContext } from "./utils/createTaskContext";

export function generateDynamicIR({
    spec,
    language,
    generatorsConfiguration,
    audiences,
    keywords,
    smartCasing
}: {
    spec: Spec;
    language: generatorsYml.GenerationLanguage;
    generatorsConfiguration?: generatorsYml.GeneratorsConfiguration;
    audiences?: Audiences;
    keywords?: string[];
    smartCasing?: boolean;
}): dynamic.DynamicIntermediateRepresentation {
    const context = createTaskContext();
    const workspace = convertSpecToWorkspace({ context, spec, generatorsConfiguration });
    const ir = generateIntermediateRepresentation({
        context,
        workspace,
        generationLanguage: language,
        audiences: audiences ?? { type: "all" },
        keywords,
        sourceResolver: new NopSourceResolver(),
        smartCasing: smartCasing ?? false,
        disableExamples: true,
        version: undefined,
        packageName: undefined,
        readme: undefined
    });
    if (ir.dynamic == null) {
        throw new Error("Internal error; failed to generate dynamic intermediate representation");
    }
    return ir.dynamic;
}
