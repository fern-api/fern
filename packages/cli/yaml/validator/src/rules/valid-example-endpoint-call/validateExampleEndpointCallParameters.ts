import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { RuleViolation } from "../../Rule";
import { validateTypeReferenceExample } from "../valid-example-type/validateTypeReferenceExample";

export function validateExampleEndpointCallParameters<T extends string | { type: string }>({
    allDeclarations = {},
    examples,
    parameterDisplayName,
    typeResolver,
    workspace,
    file,
}: {
    allDeclarations: Record<string, T> | undefined;
    examples: Record<string, string> | undefined;
    parameterDisplayName: string;
    typeResolver: TypeResolver;
    workspace: Workspace;
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
                    })
                );
            }
        }
    }

    return violations;
}
