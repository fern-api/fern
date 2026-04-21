import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { CliError } from "@fern-api/task-context";
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
        throw new CliError({
            message: "Internal error; dynamic IR is not available",
            code: CliError.Code.InternalError
        });
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
