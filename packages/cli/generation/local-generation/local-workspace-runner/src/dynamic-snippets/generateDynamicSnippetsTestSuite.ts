import { IntermediateRepresentation } from "@fern-api/ir-sdk";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { DynamicSnippetsTestSuite } from "./DynamicSnippetsTestSuite";

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
        requests: Object.values(ir.dynamic.endpoints).flatMap((endpoint) =>
            (endpoint.examples ?? []).map((example) => ({
                ...example,
                baseUrl: "https://api.fern.com"
            }))
        )
    };
}
