import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateExampleEndpointCallParameters } from "./validateExampleEndpointCallParameters";

export function validateQueryParameters({
    endpoint,
    example,
    typeResolver,
    workspace,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    workspace: Workspace;
    file: FernFileContext;
}): RuleViolation[] {
    return validateExampleEndpointCallParameters({
        allDeclarations: typeof endpoint.request !== "string" ? endpoint.request?.["query-parameters"] : undefined,
        examples: example["query-parameters"],
        parameterDisplayName: "query parameter",
        typeResolver,
        workspace,
        file,
    });
}
