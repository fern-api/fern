import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateObjectExample } from "../valid-example-type/validateObjectExample";
import { validateTypeReferenceExample } from "../valid-example-type/validateTypeReferenceExample";

export function validateRequest({
    example,
    endpoint,
    typeResolver,
    file,
    workspace,
}: {
    example: RawSchemas.ExampleTypeReferenceSchema | undefined;
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    workspace: Workspace;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const body = typeof endpoint.request !== "string" ? endpoint.request?.body : endpoint.request;

    if (body == null) {
        if (example != null) {
            violations.push({
                severity: "error",
                message: "Unexpected request in example.",
            });
        }
    } else if (isInlineRequestBody(body)) {
        violations.push(
            ...validateObjectExample({
                typeName: undefined,
                typeNameForBreadcrumb: "<Inlined Request>",
                rawObject: {
                    extends: body.extends,
                    properties: body.properties ?? {},
                },
                file,
                typeResolver,
                workspace,
                example,
            })
        );
    } else {
        violations.push(
            ...validateTypeReferenceExample({
                rawTypeReference: typeof body === "string" ? body : body.type,
                example,
                file,
                workspace,
                typeResolver,
            })
        );
    }

    return violations;
}
