/* eslint-disable @typescript-eslint/no-empty-function */
import { Rule, RuleViolation } from "../../Rule";
import { getGenericDetails } from "../../utils/getGenericDetails";
import { visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";
import { isGeneric } from "../../utils/isGeneric";

export const ValidGenericRule: Rule = {
    name: "valid-generic",
    create: async () => {
        return {
            definitionFile: {
                typeDeclaration: ({ typeName, declaration }): RuleViolation[] => {
                    const errors: RuleViolation[] = [];

                    visitRawTypeDeclaration(declaration, {
                        alias: () => {},
                        enum: (enumValue) => {
                            if (typeof enumValue !== "string") {
                                enumValue.enum.forEach((value) => {
                                    if (isGeneric(typeof value === "string" ? value : value.value)) {
                                        errors.push({
                                            severity: "error",
                                            message: `Generic values in enums are not supported: "${
                                                typeof value === "string" ? value : value.name
                                            }".`
                                        });
                                    }
                                });
                            }
                        },
                        object: (objectValue) => {
                            Object.entries(objectValue?.properties ?? {}).forEach(([propertyKey, propertyValue]) => {
                                if (isGeneric(typeof propertyValue === "string" ? propertyValue : propertyValue.type)) {
                                    errors.push({
                                        severity: "error",
                                        message: `Generic values in object properties are not supported: "${propertyKey}: ${propertyValue}".`
                                    });
                                }
                            });
                        },
                        discriminatedUnion: (discriminatedUnionValue) => {
                            Object.entries(discriminatedUnionValue.union).forEach(([key, value]) => {
                                const discriminatedUnionValue =
                                    typeof value === "string"
                                        ? value
                                        : typeof value.type === "string"
                                        ? value.type
                                        : undefined;
                                if (discriminatedUnionValue && isGeneric(discriminatedUnionValue)) {
                                    errors.push({
                                        severity: "error",
                                        message: `Generic values in discriminated unions are not supported: "${key}: ${value}".`
                                    });
                                }
                            });
                        },
                        undiscriminatedUnion: (undiscriminatedUnionValue) => {
                            undiscriminatedUnionValue.union.forEach((value) => {
                                if (isGeneric(typeof value === "string" ? value : value.type)) {
                                    errors.push({
                                        severity: "error",
                                        message: `Generic values in unions are not supported: "${
                                            typeof value === "string" ? value : value.type
                                        }".`
                                    });
                                }
                            });
                        }
                    });

                    if (!typeName.isInlined) {
                        const maybeGeneric = getGenericDetails(typeName.name);
                        if (maybeGeneric?.isGeneric) {
                            if (
                                !visitRawTypeDeclaration(declaration, {
                                    alias: () => {
                                        return true;
                                    },
                                    enum: () => {
                                        return false;
                                    },
                                    object: () => {
                                        return false;
                                    },
                                    discriminatedUnion: () => {
                                        return false;
                                    },
                                    undiscriminatedUnion: () => {
                                        return false;
                                    }
                                })
                            ) {
                                errors.push({
                                    severity: "error",
                                    message: "Generic declarations are only supported with aliases."
                                });
                            }
                        }
                    }
                    return errors;
                }
            }
        };
    }
};
