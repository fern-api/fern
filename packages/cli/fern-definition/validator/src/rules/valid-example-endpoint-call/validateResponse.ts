import chalk from "chalk";

import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas, visitExampleResponseSchema } from "@fern-api/fern-definition-schema";
import {
    ErrorResolver,
    ExampleResolver,
    ExampleValidators,
    FernFileContext,
    TypeResolver
} from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";

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
    if (example == null) {
        return validateBodyResponse({
            example: {},
            endpoint,
            typeResolver,
            exampleResolver,
            file,
            workspace,
            errorResolver
        });
    }
    return visitExampleResponseSchema(endpoint, example, {
        body: (example) =>
            validateBodyResponse({ example, endpoint, typeResolver, exampleResolver, file, workspace, errorResolver }),
        stream: (example) =>
            validateStreamResponse({ example, endpoint, typeResolver, exampleResolver, file, workspace }),
        events: (example) => validateSseResponse({ example, endpoint, typeResolver, exampleResolver, file, workspace })
    });
}

function validateBodyResponse({
    example,
    endpoint,
    typeResolver,
    exampleResolver,
    file,
    workspace,
    errorResolver
}: {
    example: RawSchemas.ExampleBodyResponseSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    exampleResolver: ExampleResolver;
    typeResolver: TypeResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
    errorResolver: ErrorResolver;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];
    if (example.error == null) {
        if (endpoint.response != null) {
            violations.push(
                ...ExampleValidators.validateTypeReferenceExample({
                    rawTypeReference:
                        typeof endpoint.response !== "string" ? endpoint.response.type : endpoint.response,
                    example: example.body,
                    typeResolver,
                    exampleResolver,
                    file,
                    workspace,
                    breadcrumbs: ["response", "body"],
                    depth: 0
                }).map((val): RuleViolation => {
                    return {
                        severity: "error",
                        message: val.message
                    };
                })
            );
        } else if (example.body != null) {
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
                    ...ExampleValidators.validateTypeReferenceExample({
                        rawTypeReference: errorDeclaration.declaration.type,
                        example: example.body,
                        typeResolver,
                        exampleResolver,
                        file: errorDeclaration.file,
                        workspace,
                        breadcrumbs: ["response", "body"],
                        depth: 0
                    }).map((val): RuleViolation => {
                        return { severity: "error", message: val.message };
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

function validateStreamResponse({
    example,
    endpoint,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    example: RawSchemas.ExampleStreamResponseSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    exampleResolver: ExampleResolver;
    typeResolver: TypeResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];
    if (endpoint["response-stream"] == null) {
        violations.push({
            severity: "error",
            message: "Unexpected streaming response in example. Endpoint's schema is missing `response-stream` key."
        });
    } else if (
        typeof endpoint["response-stream"] === "string" ||
        endpoint["response-stream"].format == null ||
        endpoint["response-stream"].format === "json"
    ) {
        for (const event of example.stream) {
            violations.push(
                ...ExampleValidators.validateTypeReferenceExample({
                    rawTypeReference:
                        typeof endpoint["response-stream"] !== "string"
                            ? endpoint["response-stream"].type
                            : endpoint["response-stream"],
                    example: event,
                    typeResolver,
                    exampleResolver,
                    file,
                    workspace,
                    breadcrumbs: ["response", "body"],
                    depth: 0
                }).map((val): RuleViolation => {
                    return { severity: "error", message: val.message };
                })
            );
        }
    } else {
        violations.push({
            severity: "error",
            message:
                "Endpoint response expects server-sent events (`response-stream.format: sse`), but the provided example is a regular stream. Use the `events` key to provide an list of server-sent event examples."
        });
    }

    return violations;
}

function validateSseResponse({
    example,
    endpoint,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    example: RawSchemas.ExampleSseResponseSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    exampleResolver: ExampleResolver;
    typeResolver: TypeResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];
    if (endpoint["response-stream"] == null) {
        violations.push({
            severity: "error",
            message: "Unexpected streaming response in example. Endpoint's schema is missing `response-stream` key."
        });
    } else if (typeof endpoint["response-stream"] !== "string" && endpoint["response-stream"].format === "sse") {
        for (const event of example.stream) {
            violations.push(
                ...ExampleValidators.validateTypeReferenceExample({
                    rawTypeReference:
                        typeof endpoint["response-stream"] !== "string"
                            ? endpoint["response-stream"].type
                            : endpoint["response-stream"],
                    example: event.data,
                    typeResolver,
                    exampleResolver,
                    file,
                    workspace,
                    breadcrumbs: ["response", "body"],
                    depth: 0
                }).map((val): RuleViolation => {
                    return { severity: "error", message: val.message };
                })
            );
        }
    } else {
        violations.push({
            severity: "error",
            message:
                "Endpoint response expects a regular stream, but the provided example is a server-sent event. Use the `stream` key to provide a list of stream examples."
        });
    }
    return violations;
}
