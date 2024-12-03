import { OpenAPIWorkspace } from "@fern-api/browser-compatible-fern-workspace";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { NopSourceResolver } from "@fern-api/source-resolver";
import { createTaskContext } from "./utils/createTaskContext";
import { Audiences, generatorsYml } from "@fern-api/configuration";
import { dynamic } from "@fern-api/ir-sdk";
import { API } from "./API";
import { convertAPIToWorkspace } from "./utils/convertAPIToWorkspace";

export async function generateDynamicIR({
    api,
    language,
    generatorsConfiguration,
    settings,
    audiences,
    keywords,
    smartCasing
}: {
    api: API;
    language: generatorsYml.GenerationLanguage;
    generatorsConfiguration?: generatorsYml.GeneratorsConfiguration;
    settings?: OpenAPIWorkspace.Settings;
    audiences?: Audiences;
    keywords?: string[];
    smartCasing?: boolean;
}): Promise<dynamic.DynamicIntermediateRepresentation> {
    const context = createTaskContext();
    const workspace = await convertAPIToWorkspace({ context, api, generatorsConfiguration, settings });
    const ir = await generateIntermediateRepresentation({
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
