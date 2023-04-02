import { ExampleResolver, FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateTypeReferenceExample } from "../valid-example-type/validateTypeReferenceExample";

export function validateExampleEndpointCallParameters<T>({
    allDeclarations = {},
    examples,
    parameterDisplayName,
    typeResolver,
    exampleResolver,
    workspace,
    getRawType,
}: {
    allDeclarations: Record<string, T> | undefined;
    examples: Record<string, RawSchemas.ExampleTypeReferenceSchema> | undefined;
    parameterDisplayName: string;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
    getRawType: (parameter: T) => { rawType: string; file: FernFileContext } | undefined;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const requiredParameters = Object.entries(allDeclarations).reduce<string[]>((acc, [key, parameter]) => {
        const rawType = getRawType(parameter);

        // if rawType is not defined, then variable couldn't be de-referenced.
        // this will be caught by another rule
        if (rawType != null) {
            const resolvedType = typeResolver.resolveType({
                type: rawType.rawType,
                file: rawType.file,
            });

            const isOptional =
                resolvedType != null &&
                resolvedType._type === "container" &&
                resolvedType.container._type === "optional";

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
                message: `Example is missing required ${parameterDisplayName} "${requiredKey}"`,
            });
        }
    }

    if (examples != null) {
        for (const [key, exampleParameter] of Object.entries(examples)) {
            const expectedType = allDeclarations[key];
            if (expectedType == null) {
                violations.push({
                    severity: "error",
                    message: `Unexpected ${parameterDisplayName} "${key}"`,
                });
            } else {
                const rawType = getRawType(expectedType);

                // if rawType is not defined, then variable couldn't be de-referenced.
                // this will be caught by another rule
                if (rawType != null) {
                    violations.push(
                        ...validateTypeReferenceExample({
                            rawTypeReference: rawType.rawType,
                            example: exampleParameter,
                            file: rawType.file,
                            workspace,
                            typeResolver,
                            exampleResolver,
                        })
                    );
                }
            }
        }
    }

    return violations;
}
