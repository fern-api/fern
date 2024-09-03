/* eslint-disable @typescript-eslint/no-empty-function */
import { Rule, RuleViolation } from "../../Rule";
import { getGenericDetails } from "../../utils/getGenericDetails";
import { visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";
import { isGeneric } from "../../utils/isGeneric";
import { FernWorkspace, visitAllDefinitionFiles } from "@fern-api/workspace-loader";
import { visitDefinitionFileYamlAst } from "../../ast";

export const ValidGenericRule: Rule = {
    name: "valid-generic",
    create: async ({ workspace }) => {
        const genericArgumentCounts = await getGenericArgumentCounts(workspace);

        return {
            definitionFile: {
                typeDeclaration: ({ typeName, declaration }): RuleViolation[] => {
                    const errors: RuleViolation[] = [];

                    if (!typeName.isInlined) {
                        const maybeGeneric = getGenericDetails(typeName.name);
                        if (maybeGeneric?.isGeneric) {
                            if (
                                !visitRawTypeDeclaration(declaration, {
                                    alias: () => {
                                        return false;
                                    },
                                    enum: () => {
                                        return false;
                                    },
                                    object: () => {
                                        return true;
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
                                    message: "Generic declarations are only supported with objects."
                                });
                            }
                        }
                    }

                    visitRawTypeDeclaration(declaration, {
                        alias: (aliasValue) => {
                            const alias = typeof aliasValue === "string" ? aliasValue : aliasValue.type;
                            const maybeGeneric = getGenericDetails(alias);
                            if (maybeGeneric && maybeGeneric.isGeneric && maybeGeneric.name && maybeGeneric.arguments) {
                                const [maybeTypeName, typeName, ..._rest] = maybeGeneric.name.split(".");
                                const key = typeName ?? maybeTypeName;
                                if (key && genericArgumentCounts[key] !== maybeGeneric.arguments.length) {
                                    errors.push({
                                        severity: "error",
                                        message: `Generic "${key}" expects ${
                                            genericArgumentCounts[key] ?? 0
                                        } arguments but was instantiated with ${
                                            maybeGeneric.arguments.length
                                        } arguments.`
                                    });
                                }
                            } else {
                                if (Object.hasOwn(genericArgumentCounts, alias)) {
                                    errors.push({
                                        severity: "error",
                                        message: "Generic value is supplied, but no arguments are defined."
                                    });
                                }
                            }
                        },
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

                    return errors;
                }
            }
        };
    }
};

async function getGenericArgumentCounts(workspace: FernWorkspace): Promise<Record<string, number>> {
    const genericArgumentCounts: Record<string, number> = {};

    await visitAllDefinitionFiles(workspace, async (relativeFilepath, file) => {
        await visitDefinitionFileYamlAst(file, {
            typeDeclaration: ({ typeName, declaration }) => {
                if (!typeName.isInlined) {
                    const maybeGeneric = getGenericDetails(typeName.name);
                    if (maybeGeneric?.isGeneric) {
                        visitRawTypeDeclaration(declaration, {
                            alias: () => {},
                            enum: () => {},
                            object: () => {
                                if (maybeGeneric.name && maybeGeneric.arguments) {
                                    genericArgumentCounts[maybeGeneric.name] = maybeGeneric.arguments.length;
                                }
                            },
                            discriminatedUnion: () => {},
                            undiscriminatedUnion: () => {}
                        });
                    }
                }
            }
        });
    });

    return genericArgumentCounts;
}
