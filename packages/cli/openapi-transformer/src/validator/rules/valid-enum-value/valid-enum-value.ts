import { IFunctionResult } from "@stoplight/spectral-core";
import { SpectralRule } from "../Rule";

const X_ENUM_NAMES_FIELD = "x-enum-names";

export const ValidEnumValue: SpectralRule = {
    name: "valid-enum-value",
    get: () => {
        return {
            given: ["$.components.schemas.*"],
            resolved: false,
            then: [
                {
                    function: (schema, _, { path }) => {
                        if (schema.enum == null) {
                            return;
                        }

                        const results: IFunctionResult[] = [];

                        const enumNames = schema[X_ENUM_NAMES_FIELD] ?? {};
                        for (const enumValue of schema.enum) {
                            if (isEnumValueValidForCodegen(enumValue)) {
                                continue;
                            }

                            const name = enumNames[enumValue];
                            if (name == null) {
                                results.push({
                                    message: `Enum value ${enumValue} is not suitable for code generation. Please add an entry to ${X_ENUM_NAMES_FIELD} where the key is ${enumValue} and the value is a name that starts with a letter and contains only letters, numbers, and underscores.`,
                                    path: [...path, "enum", enumValue],
                                });
                            } else if (!isEnumValueValidForCodegen(name)) {
                                results.push({
                                    message: `Enum name ${name} is not suitable for code generation.`,
                                    path: [...path, X_ENUM_NAMES_FIELD, enumValue],
                                });
                            }
                        }

                        return results;
                    },
                },
            ],
        };
    },
};

const VALID_NAME_REGEX = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
function isEnumValueValidForCodegen(enumValue: string): boolean {
    return VALID_NAME_REGEX.test(enumValue);
}
