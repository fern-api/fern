import { getEnumName } from "@fern-api/ir-generator";
import { isRawEnumDefinition } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

// Enum names must start with a letter and contain only letters, numbers, and underscores
const ENUM_NAME_REGEX = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

export const ValidEnumNameRule: Rule = {
    name: "valid-enum-name",
    create: () => {
        return {
            typeDeclaration: ({ declaration }) => {
                const violations: RuleViolation[] = [];

                if (!isRawEnumDefinition(declaration)) {
                    return violations;
                }

                declaration.enum.forEach((enumValue) => {
                    const enumName = getEnumName(enumValue);

                    if (ENUM_NAME_REGEX.test(enumName.name)) {
                        return;
                    }

                    if (enumName.wasExplicitlySet) {
                        violations.push({
                            severity: "error",
                            message: `Enum name ${chalk.bold(
                                enumName.name
                            )} is invalid. It must start with a letter and only contain letters, numbers, and underscores.`,
                        });
                    } else {
                        violations.push({
                            severity: "error",
                            message: `Enum value ${chalk.bold(
                                typeof enumValue === "string" ? enumValue : enumValue.value
                            )} requires a "name" property that starts with a letter and contains only letters, numbers, and underscores. This is used for code generation.`,
                        });
                    }
                });

                return violations;
            },
        };
    },
};
