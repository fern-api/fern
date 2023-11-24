import { ErrorResolver, ExampleResolver, FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { RuleViolation } from "../../Rule";
import { validateTypeReferenceExample } from "../valid-example-type/validateTypeReferenceExample";

export function validateResponse({
    example,
    endpoint,
    typeResolver,
    exampleResolver,
    file,
    workspace,
    errorResolver
}: {
    example: RawSchemas.ExampleResponseSchema | undefined;
    endpoint: RawSchemas.HttpEndpointSchema;
    exampleResolver: ExampleResolver;
    typeResolver: TypeResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
    errorResolver: ErrorResolver;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];
    if (example?.error == null) {
        if (endpoint.response != null) {
            violations.push(
                ...validateTypeReferenceExample({
                    rawTypeReference:
                        typeof endpoint.response !== "string" ? endpoint.response.type : endpoint.response,
                    example: example?.body,
                    typeResolver,
                    exampleResolver,
                    file,
                    workspace
                })
            );
        } else if (example?.body != null) {
            violations.push({
                severity: "error",
                message:
                    "Unexpected response in example. If you're adding an example of an error response, set the \"error\" property to the error's name"
            });
        }
    } else {
        const errorDeclaration = errorResolver.getDeclaration(example.error, file);

        // if error doesn't exist. this will be caught by another rule
        if (errorDeclaration != null) {
            const endpointAllowsForError =
                endpoint.errors != null &&
                endpoint.errors.some((error) => {
                    const specifiedErrorName = typeof error !== "string" ? error.error : error;
                    return specifiedErrorName === example.error;
                });
            if (!endpointAllowsForError) {
                violations.push({
                    severity: "error",
                    message: `${chalk.bold(
                        example.error
                    )} is not specified as an allowed error for this endpoint. Add ${chalk.bold(
                        example.error
                    )} to the endpoint's "errors" list.`
                });
            }

            if (errorDeclaration.declaration.type != null) {
                violations.push(
                    ...validateTypeReferenceExample({
                        rawTypeReference: errorDeclaration.declaration.type,
                        example: example.body,
                        typeResolver,
                        exampleResolver,
                        file: errorDeclaration.file,
                        workspace
                    })
                );
            } else if (example.body != null) {
                violations.push({
                    severity: "error",
                    message: `Unexpected response in example. ${chalk.bold(example.error)} does not have a body.`
                });
            }
        }
    }

    return violations;
}
