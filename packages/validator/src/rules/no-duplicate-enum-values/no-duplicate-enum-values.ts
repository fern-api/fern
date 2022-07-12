import { isRawEnumDefinition } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { Rule } from "../../Rule";

export const NoDuplicateEnumValuesRule: Rule = {
    name: "no-duplicate-enum-values",
    create: () => {
        return {
            typeDeclaration: ({ declaration }) => {
                if (!isRawEnumDefinition(declaration)) {
                    return [];
                }

                const seenValues = new Set<string>();
                const duplicatedValues = new Set<string>();
                for (const enumValue of declaration.enum) {
                    const value = typeof enumValue === "string" ? enumValue : enumValue.value;
                    if (seenValues.has(value)) {
                        duplicatedValues.add(value);
                    }
                    seenValues.add(value);
                }

                return [...duplicatedValues].map((duplicatedValue) => ({
                    severity: "error",
                    message: `Duplicated enum value: ${chalk.bold(duplicatedValue)}`,
                }));
            },
        };
    },
};
