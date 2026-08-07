import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isInlineRequestBody, RawSchemas } from "@fern-api/fern-definition-schema";
import { ExampleResolver, ExampleValidators, FernFileContext, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule.js";

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
                severity: "fatal",
                message: "Unexpected request in example."
            });
        }
    } else if (isInlineRequestBody(body)) {
        // an omitted request represents a call with no request body, which the endpoint
        // only permits when its body is optional
        if (example == null) {
            if (body.optional) {
                return violations;
            }
            violations.push({
                severity: "fatal",
                message:
                    "This endpoint requires a request body, so its examples must specify request. " +
                    "Mark the body optional to allow calling the endpoint without one."
            });
            return violations;
        }
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
                return { severity: val.severity ?? "fatal", message: val.message };
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
                return { severity: val.severity ?? "fatal", message: val.message };
            })
        );
    }

    return violations;
}
