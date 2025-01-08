import chalk from "chalk";

import { RawSchemas } from "@fern-api/fern-definition-schema";
import { getUnionDiscriminantName } from "@fern-api/ir-generator";

import { RuleViolation } from "../../Rule";
import { VALID_NAME_REGEX } from "./regex";

export function validateUnionNames(declaration: RawSchemas.DiscriminatedUnionSchema): RuleViolation[] {
    const violations: RuleViolation[] = [];

    const discriminantName = getUnionDiscriminantName(declaration);

    if (VALID_NAME_REGEX.test(discriminantName.name)) {
        return violations;
    }

    if (discriminantName.wasExplicitlySet) {
        violations.push({
            severity: "error",
            message: `Discriminant name ${chalk.bold(
                discriminantName.name
            )} is not suitable for code generation. It must start with a letter and only contain letters, numbers, and underscores.`
        });
    } else {
        violations.push({
            severity: "error",
            message: `Discriminant value ${chalk.bold(
                discriminantName.name
            )} is not suitable for code generation. Add a "name" property that starts with a letter and contains only letters, numbers, and underscores.`
        });
    }

    return violations;
}
