import { RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { TypeResolver, TypeResolverImpl } from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";

export const ValidVersionRule: Rule = {
    name: "valid-version",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            rootApiFile: {
                file: (root) => {
                    return validateApiVersionSchema({
                        root,
                        typeResolver
                    });
                }
            }
        };
    }
};

function validateApiVersionSchema({
    root,
    typeResolver
}: {
    root: RootApiFileSchema;
    typeResolver: TypeResolver;
}): RuleViolation[] {
    const violations: RuleViolation[] = [];
    if (root.version == null || root.version.default == null) {
        return [];
    }
    const enumValues = new Set<string>(
        root.version.values.map((enumValue) => (typeof enumValue === "string" ? enumValue : enumValue.value))
    );
    if (!enumValues.has(root.version.default)) {
        violations.push({
            severity: "error",
            message: `Default version "${root.version.default}" not found in version values`
        });
    }
    return violations;
}
