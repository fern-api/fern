import { replaceSpecialCharsWithWords } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { getEnumName } from "@fern-api/ir-generator";
import chalk from "chalk";
import { camelCase, upperFirst } from "lodash-es";

import { RuleViolation } from "../../Rule.js";
import { VALID_NAME_REGEX } from "./regex.js";

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

        // Try to auto-convert the name if it contains characters outside the
        // valid identifier set [a-zA-Z0-9_]. This handles special chars like %,
        // and separator chars like . or : that camelCase can handle.
        // Names that only fail due to leading underscore/number (e.g. _invalidName,
        // 523_Invalid) are NOT auto-converted - those need explicit user fixes.
        const hasNonIdentifierChars = /[^a-zA-Z0-9_]/.test(enumName.name);
        const withWords = replaceSpecialCharsWithWords(enumName.name);
        const converted = upperFirst(camelCase(withWords));
        if (hasNonIdentifierChars && converted.length > 0 && VALID_NAME_REGEX.test(converted)) {
            violations.push({
                severity: "warning",
                message: `Enum ${enumName.wasExplicitlySet ? "name" : "value"} ${chalk.bold(
                    enumName.name
                )} contains special characters. It will be converted to ${chalk.bold(
                    converted
                )} for code generation.${openApiGuidance}`
            });
            return;
        }

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
