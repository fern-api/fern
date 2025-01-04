import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas, isInlineRequestBody } from "@fern-api/fern-definition-schema";
import { ExampleResolver, ExampleValidators, FernFileContext, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";

export function validateRequest({
    example,
    endpoint,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    example: RawSchemas.ExampleTypeReferenceSchema | undefined;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const body = typeof endpoint.request !== "string" ? endpoint.request?.body : endpoint.request;

    if (body == null) {
        if (example != null) {
            violations.push({
                severity: "error",
                message: "Unexpected request in example."
            });
        }
    } else if (isInlineRequestBody(body)) {
        violations.push(
            ...ExampleValidators.validateObjectExample({
                typeName: undefined,
                typeNameForBreadcrumb: "<Inlined Request>",
                rawObject: {
                    "extra-properties": body["extra-properties"],
                    extends: body.extends,
                    properties: body.properties ?? {}
                },
                file,
                typeResolver,
                exampleResolver,
                workspace,
                example,
                breadcrumbs: ["request"],
                depth: 0
            }).map((val): RuleViolation => {
                return { severity: "error", message: val.message };
            })
        );
    } else {
        violations.push(
            ...ExampleValidators.validateTypeReferenceExample({
                rawTypeReference: typeof body === "string" ? body : body.type,
                example,
                file,
                workspace,
                typeResolver,
                exampleResolver,
                breadcrumbs: ["response", "body"],
                depth: 0
            }).map((val): RuleViolation => {
                return { severity: "error", message: val.message };
            })
        );
    }

    return violations;
}
