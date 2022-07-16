import { isRawEnumDefinition } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

// Enum names must start with a letter
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
                declaration.enum.forEach((val) => {
                    const name = typeof val === "string" ? val : val.name ?? val.value;
                    const nameIsValue = typeof val === "string" || val.name == null;
                    const isValid = ENUM_NAME_REGEX.test(name);
                    if (isValid) {
                        return;
                    }
                    if (nameIsValue) {
                        violations.push({
                            severity: "error",
                            message: `Please add an enum name for the folliwng enum: ${chalk.bold(
                                name
                            )}. Make sure the name starts with a letter and only contains alphanumeric and underscore characters.`,
                        });
                    } else {
                        violations.push({
                            severity: "error",
                            message: `Found illegal enum name: ${chalk.bold(
                                name
                            )}. Please make sure name starts with a letter and only contains alphanumeric and underscore characters.`,
                        });
                    }
                });
                return violations;
            },
        };
    },
};
