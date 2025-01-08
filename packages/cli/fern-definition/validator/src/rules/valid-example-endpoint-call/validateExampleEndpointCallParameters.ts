import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ExampleResolver, ExampleValidators, FernFileContext, TypeResolver } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";

export function validateExampleEndpointCallParameters<T>({
    allDeclarations = {},
    examples,
    parameterDisplayName,
    typeResolver,
    exampleResolver,
    workspace,
    getRawType,
    breadcrumbs
}: {
    allDeclarations: Record<string, T> | undefined;
    examples: Record<string, RawSchemas.ExampleTypeReferenceSchema> | undefined;
    parameterDisplayName: string;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
    getRawType: (parameter: T) => { rawType: string; file: FernFileContext } | undefined;
    breadcrumbs: string[];
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const requiredParameters = Object.entries(allDeclarations).reduce<string[]>((acc, [key, parameter]) => {
        const rawType = getRawType(parameter);

        // if rawType is not defined, then variable couldn't be de-referenced.
        // this will be caught by another rule
        if (rawType != null) {
            const resolvedType = typeResolver.resolveType({
                type: rawType.rawType,
                file: rawType.file
            });

            const isOptional =
                (resolvedType != null &&
                    resolvedType._type === "container" &&
                    resolvedType.container._type === "optional") ||
                resolvedType?._type === "unknown";

            if (!isOptional) {
                acc.push(key);
            }
        }

        return acc;
    }, []);

    for (const requiredKey of requiredParameters) {
        if (examples?.[requiredKey] == null) {
            violations.push({
                severity: "error",
                message: `Example is missing required ${parameterDisplayName} "${requiredKey}"`
            });
        }
    }

    if (examples != null) {
        for (const [key, exampleParameter] of Object.entries(examples)) {
            const expectedType = allDeclarations[key];
            if (expectedType == null) {
                violations.push({
                    severity: "error",
                    message: `Unexpected ${parameterDisplayName} "${key}"`
                });
            } else {
                const rawType = getRawType(expectedType);

                // if rawType is not defined, then variable couldn't be de-referenced.
                // this will be caught by another rule
                if (rawType != null) {
                    violations.push(
                        ...ExampleValidators.validateTypeReferenceExample({
                            rawTypeReference: rawType.rawType,
                            example: exampleParameter,
                            file: rawType.file,
                            workspace,
                            typeResolver,
                            exampleResolver,
                            breadcrumbs,
                            depth: 0
                        }).map((val): RuleViolation => {
                            return { severity: "error", message: val.message };
                        })
                    );
                }
            }
        }
    }

    return violations;
}
