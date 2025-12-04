import { RawSchemas } from "@fern-api/fern-definition-schema";
import { getEnumName } from "@fern-api/ir-generator";
import chalk from "chalk";

import { RuleViolation } from "../../Rule";
import { VALID_NAME_REGEX } from "./regex";

const X_FERN_ENUM_DOCS_LINK =
    "https://buildwithfern.com/learn/api-definitions/openapi/extensions/enum-descriptions-and-names";

export interface ValidateEnumNamesOptions {
    hasOpenAPISource: boolean;
}

function getEnumWireValue(enumValue: string | RawSchemas.EnumValueSchema): string {
    if (typeof enumValue === "string") {
        return enumValue;
    }
    return enumValue.value;
}

export function validateEnumNames(
    declaration: RawSchemas.EnumSchema,
    options: ValidateEnumNamesOptions = { hasOpenAPISource: false }
): RuleViolation[] {
    const violations: RuleViolation[] = [];

    declaration.enum.forEach((enumValue) => {
        const enumName = getEnumName(enumValue);
        const wireValue = getEnumWireValue(enumValue);

        if (VALID_NAME_REGEX.test(enumName.name)) {
            return;
        }

        const openApiGuidance = options.hasOpenAPISource
            ? ` If your API is defined using OpenAPI, you can use the x-fern-enum extension to specify a valid name: ${X_FERN_ENUM_DOCS_LINK}`
            : "";

        if (enumName.wasExplicitlySet) {
            violations.push({
                severity: "fatal",
                message: `Enum name ${chalk.bold(enumName.name)} for value ${chalk.bold(
                    wireValue
                )} is not suitable for code generation. It must start with a letter and only contain letters, numbers, and underscores.${openApiGuidance}`
            });
        } else {
            violations.push({
                severity: "fatal",
                message: `Enum value ${chalk.bold(
                    enumName.name
                )} is not suitable for code generation. Add a "name" property that starts with a letter and contains only letters, numbers, and underscores.${openApiGuidance}`
            });
        }
    });

    return violations;
}
