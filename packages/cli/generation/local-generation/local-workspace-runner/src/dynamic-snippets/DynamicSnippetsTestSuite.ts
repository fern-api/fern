import { dynamic as DynamicSnippets } from "@fern-api/ir-sdk";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export interface DynamicSnippetsTestRequest {
    endpointId: string;
    request: DynamicSnippets.EndpointSnippetRequest;
}

export interface DynamicSnippetsTestSuite {
    ir: DynamicSnippets.DynamicIntermediateRepresentation;
    config: FernGeneratorExec.GeneratorConfig;
    requests: DynamicSnippetsTestRequest[];
    // Type IDs that the generator emits as inline (nested) classes. The dynamic IR does not carry
    // the `inline` flag, so it is computed from the full IR and threaded through to the
    // language-specific generators that need it to resolve nested class names.
    inlineTypeIds: Set<string>;
}
