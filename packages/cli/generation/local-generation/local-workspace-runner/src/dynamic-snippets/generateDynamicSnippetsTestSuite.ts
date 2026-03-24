import { IntermediateRepresentation } from "@fern-api/ir-sdk";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { DynamicSnippetsTestSuite } from "./DynamicSnippetsTestSuite.js";

export async function generateDynamicSnippetsTestSuite({
    ir,
    config
}: {
    ir: IntermediateRepresentation;
    config: FernGeneratorExec.GeneratorConfig;
}): Promise<DynamicSnippetsTestSuite> {
    if (ir.dynamic == null) {
        throw new Error("Internal error; dynamic IR is not available");
    }
    return {
        ir: ir.dynamic,
        config,
        requests: Object.entries(ir.dynamic.endpoints).flatMap(([endpointId, endpoint]) =>
            (endpoint.examples ?? []).map((example) => ({
                endpointId,
                request: {
                    ...example,
                    baseUrl: "https://api.fern.com"
                }
            }))
        )
    };
}
