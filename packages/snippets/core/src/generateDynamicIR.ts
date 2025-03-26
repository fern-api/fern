import { Audiences, generatorsYml } from "@fern-api/configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { dynamic } from "@fern-api/ir-sdk";
import { NopSourceResolver } from "@fern-api/source-resolver";

import { OpenAPISpec } from "./Spec";
import { convertSpecToWorkspace } from "./utils/convertSpecToWorkspace";
import { createTaskContext } from "./utils/createTaskContext";

export function generateDynamicIR({
    spec,
    language,
    audiences,
    keywords,
    smartCasing,
    disableDynamicExamples
}: {
    spec: OpenAPISpec;
    language: generatorsYml.GenerationLanguage;
    audiences?: Audiences;
    keywords?: string[];
    smartCasing?: boolean;
    disableDynamicExamples?: boolean;
}): dynamic.DynamicIntermediateRepresentation {
    return generateDynamicIRFromOpenAPI({
        spec,
        language,
        audiences,
        keywords,
        smartCasing,
        disableDynamicExamples
    });
}

function generateDynamicIRFromOpenAPI({
    spec,
    language,
    audiences,
    keywords,
    smartCasing,
    disableDynamicExamples
}: {
    spec: OpenAPISpec;
    language: generatorsYml.GenerationLanguage;
    audiences?: Audiences;
    keywords?: string[];
    smartCasing?: boolean;
    disableDynamicExamples?: boolean;
}): dynamic.DynamicIntermediateRepresentation {
    const context = createTaskContext();
    const workspace = convertSpecToWorkspace({ context, spec });
    const ir = generateIntermediateRepresentation({
        context,
        workspace,
        generationLanguage: language,
        audiences: audiences ?? { type: "all" },
        keywords,
        sourceResolver: new NopSourceResolver(),
        smartCasing: smartCasing ?? false,
        exampleGeneration: { disabled: true },
        disableDynamicExamples,
        version: undefined,
        packageName: undefined,
        readme: undefined
    });
    if (ir.dynamic == null) {
        throw new Error("Internal error; failed to generate dynamic intermediate representation");
    }
    return ir.dynamic;
}
