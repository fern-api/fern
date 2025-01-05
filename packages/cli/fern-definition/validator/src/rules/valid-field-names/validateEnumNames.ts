import chalk from "chalk";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { getEnumName } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";
import { VALID_NAME_REGEX } from "./regex";

export function validateEnumNames(declaration: RawSchemas.EnumSchema): RuleViolation[] {
    const violations: RuleViolation[] = [];

    declaration.enum.forEach((enumValue) => {
        const enumName = getEnumName(enumValue);

        if (VALID_NAME_REGEX.test(enumName.name)) {
            return;
        }

        if (enumName.wasExplicitlySet) {
            violations.push({
                severity: "error",
                message: `Enum name ${chalk.bold(
                    enumName.name
                )} is not suitable for code generation. It must start with a letter and only contain letters, numbers, and underscores.`
            });
        } else {
            violations.push({
                severity: "error",
                message: `Enum value ${chalk.bold(
                    enumName.name
                )} is not suitable for code generation. Add a "name" property that starts with a letter and contains only letters, numbers, and underscores.`
            });
        }
    });

    return violations;
}
