import { dynamic as DynamicSnippets } from "@fern-api/ir-sdk";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export interface DynamicSnippetsTestSuite {
    ir: DynamicSnippets.DynamicIntermediateRepresentation;
    config: FernGeneratorExec.GeneratorConfig;
    requests: DynamicSnippets.EndpointSnippetRequest[];
}
