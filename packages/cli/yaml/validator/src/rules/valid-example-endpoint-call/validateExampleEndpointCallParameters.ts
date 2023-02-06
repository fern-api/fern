import { ExampleResolver, FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateTypeReferenceExample } from "../valid-example-type/validateTypeReferenceExample";

export function validateExampleEndpointCallParameters<T extends string | { type: string }>({
    allDeclarations = {},
    examples,
    parameterDisplayName,
    typeResolver,
    exampleResolver,
    workspace,
    file,
}: {
    allDeclarations: Record<string, T> | undefined;
    examples: Record<string, RawSchemas.ExampleTypeReferenceSchema> | undefined;
    parameterDisplayName: string;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
    file: FernFileContext;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const requiredParameters = Object.entries(allDeclarations).reduce<string[]>((acc, [key, parameter]) => {
        const resolvedType = typeResolver.resolveType({
            type: typeof parameter !== "string" ? parameter.type : parameter,
            file,
        });

        const isOptional =
            resolvedType != null && resolvedType._type === "container" && resolvedType.container._type === "optional";

        if (!isOptional) {
            acc.push(key);
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
                violations.push(
                    ...validateTypeReferenceExample({
                        rawTypeReference: typeof expectedType !== "string" ? expectedType.type : expectedType,
                        example: exampleParameter,
                        file,
                        workspace,
                        typeResolver,
                        exampleResolver,
                    })
                );
            }
        }
    }

    return violations;
}
