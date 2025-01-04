/* eslint-disable @typescript-eslint/no-empty-function */
import { FernWorkspace, visitAllDefinitionFiles } from "@fern-api/api-workspace-commons";
import { NodePath, isGeneric, parseGeneric, visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";

import { Rule, RuleViolation } from "../../Rule";
import { visitDefinitionFileYamlAst } from "../../ast";

type GenericDeclaration = string;
type PropertyBasedTypeDeclaration = "object" | "discriminatedUnion";

export const ValidGenericRule: Rule = {
    name: "valid-generic",
    create: ({ workspace }) => {
        const genericArgumentCounts = getGenericArgumentCounts(workspace);
        const propertyBasedErrors: Record<
            PropertyBasedTypeDeclaration,
            {
                key: string;
                nodePath: NodePath;
            }[]
        > = {
            object: [],
            discriminatedUnion: []
        };

        return {
            definitionFile: {
                typeDeclaration: ({ typeName, declaration, nodePath }): RuleViolation[] => {
                    const errors: RuleViolation[] = [];

                    if (!typeName.isInlined) {
                        const maybeGeneric = parseGeneric(typeName.name);
                        if (maybeGeneric != null) {
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
                                    message: "Generics are only supported for object declarations"
                                });
                            }
                        }
                    }

                    visitRawTypeDeclaration(declaration, {
                        alias: (aliasValue) => {
                            const alias = typeof aliasValue === "string" ? aliasValue : aliasValue.type;
                            const maybeGeneric = parseGeneric(alias);
                            if (maybeGeneric != null) {
                                const [maybeTypeName, typeName, ..._rest] = maybeGeneric.name.split(".");
                                const key = typeName ?? maybeTypeName;
                                if (
                                    key &&
                                    key in genericArgumentCounts &&
                                    genericArgumentCounts[key] !== maybeGeneric.arguments.length
                                ) {
                                    errors.push({
                                        severity: "error",
                                        message: `Generic ${key} expects ${
                                            genericArgumentCounts[key]
                                        } arguments, but received ${
                                            maybeGeneric.arguments.length
                                        } <${maybeGeneric.arguments.join(",")}>`
                                    });
                                }
                            } else {
                                if (alias in genericArgumentCounts) {
                                    errors.push({
                                        severity: "error",
                                        message: `Generic ${alias} expects ${genericArgumentCounts[alias]} arguments, but received none`
                                    });
                                }
                            }
                        },
                        enum: (enumValue) => {
                            if (typeof enumValue !== "string") {
                                enumValue.enum.forEach((value) => {
                                    const enumValue = typeof value === "string" ? value : value.value;
                                    if (isGeneric(enumValue)) {
                                        errors.push({
                                            severity: "error",
                                            message: `Cannot reference generic ${enumValue} from enum`
                                        });
                                    }
                                });
                            }
                        },
                        object: (objectValue) => {
                            Object.entries(objectValue?.properties ?? {}).forEach(([key, value]) => {
                                if (isGeneric(typeof value === "string" ? value : value.type)) {
                                    if (nodePath) {
                                        (propertyBasedErrors.object ??= []).push({
                                            key,
                                            nodePath
                                        });
                                    } else {
                                        errors.push({
                                            severity: "error",
                                            message: `Cannot reference generic ${value} from object property ${key}`
                                        });
                                    }
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
                                    if (nodePath) {
                                        (propertyBasedErrors.discriminatedUnion ??= []).push({
                                            key,
                                            nodePath
                                        });
                                    } else {
                                        errors.push({
                                            severity: "error",
                                            message: `Cannot reference generic ${value} from union property ${key}`
                                        });
                                    }
                                }
                            });
                        },
                        undiscriminatedUnion: (undiscriminatedUnionValue) => {
                            undiscriminatedUnionValue.union.forEach((value) => {
                                const discriminatedUnionValue = typeof value === "string" ? value : value.type;
                                if (isGeneric(discriminatedUnionValue)) {
                                    errors.push({
                                        severity: "error",
                                        message: `Cannot reference generic ${discriminatedUnionValue} from union`
                                    });
                                }
                            });
                        }
                    });

                    return errors;
                },
                typeReference: ({ typeReference, nodePath }): RuleViolation[] => {
                    const errors: RuleViolation[] = [];
                    if (nodePath) {
                        for (const propertyBasedTypeDeclaration of Object.keys(
                            propertyBasedErrors
                        ) as PropertyBasedTypeDeclaration[]) {
                            for (const { key, nodePath: propertyNodePath } of propertyBasedErrors[
                                propertyBasedTypeDeclaration
                            ]) {
                                if (
                                    propertyNodePath.length > 0 &&
                                    nodePath.join(",").startsWith(propertyNodePath.join(",")) &&
                                    nodePath.includes(key)
                                ) {
                                    errors.push({
                                        severity: "error",
                                        message: `Cannot reference generic ${typeReference} from ${
                                            propertyBasedTypeDeclaration.toLowerCase().includes("union")
                                                ? "union"
                                                : propertyBasedTypeDeclaration
                                        }`
                                    });
                                }
                            }
                        }
                    }
                    return errors;
                }
            }
        };
    }
};

function getGenericArgumentCounts(workspace: FernWorkspace): Record<string, number> {
    const genericArgumentCounts: Record<GenericDeclaration, number> = {};

    visitAllDefinitionFiles(workspace, (relativeFilepath, file) => {
        visitDefinitionFileYamlAst(file, {
            typeDeclaration: ({ typeName, declaration }) => {
                if (!typeName.isInlined) {
                    const maybeGeneric = parseGeneric(typeName.name);
                    if (maybeGeneric != null) {
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
