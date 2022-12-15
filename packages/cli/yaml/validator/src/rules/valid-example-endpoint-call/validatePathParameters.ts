import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateExampleEndpointCallParameters } from "./validateExampleEndpointCallParameters";

export function validatePathParameters({
    service,
    endpoint,
    example,
    typeResolver,
    workspace,
    file,
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    workspace: Workspace;
    file: FernFileContext;
}): RuleViolation[] {
    return validateExampleEndpointCallParameters({
        allDeclarations: {
            ...service["path-parameters"],
            ...endpoint["path-parameters"],
        },
        examples: example["path-parameters"],
        parameterDisplayName: "path parameter",
        typeResolver,
        workspace,
        file,
    });
}
