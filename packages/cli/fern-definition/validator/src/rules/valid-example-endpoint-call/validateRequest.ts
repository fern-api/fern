import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isInlineRequestBody, RawSchemas } from "@fern-api/fern-definition-schema";
import { ExampleResolver, ExampleValidators, FernFileContext, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule.js";

const REQUIRED_REQUEST_BODY_VIOLATION: RuleViolation = {
    severity: "fatal",
    message:
        "This endpoint requires a request body, so its examples must specify request. " +
        "Mark the body optional to allow calling the endpoint without one."
};

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
        if (example === undefined) {
            if (body.optional) {
                return violations;
            }
            violations.push(REQUIRED_REQUEST_BODY_VIOLATION);
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
        // `optional: true` says the call may omit the body, so an example without a `request` is a
        // valid call with no body — the same way it is for an inline body marked optional.
        if (example === undefined && typeof body !== "string" && body.optional === true) {
            return violations;
        }
        const bodyViolations = ExampleValidators.validateTypeReferenceExample({
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
        });
        // an omitted request against a body that isn't optional is a common mistake, so report it
        // the same way the inlined branch does rather than with the generic type-mismatch message
        if (example === undefined && bodyViolations.length > 0) {
            violations.push(REQUIRED_REQUEST_BODY_VIOLATION);
            return violations;
        }
        violations.push(...bodyViolations);
    }

    return violations;
}
