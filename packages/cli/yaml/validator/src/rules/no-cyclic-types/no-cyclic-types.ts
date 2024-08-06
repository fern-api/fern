import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    constructFernFileContext,
    FernFileContext,
    getAllPropertiesForType,
    ResolvedType,
    TypeResolver,
    TypeResolverImpl
} from "@fern-api/ir-generator";
import {
    CASINGS_GENERATOR,
    ObjectPropertyWithPath,
    TypeName
} from "@fern-api/ir-generator/src/utils/getAllPropertiesForObject";
import { FernWorkspace } from "@fern-api/workspace-loader";
import {
    isRawDiscriminatedUnionDefinition,
    isRawObjectDefinition,
    isRawUndiscriminatedUnionDefinition,
    RawSchemas
} from "@fern-api/yaml-schema";
import { Rule } from "../../Rule";
import { getTypeDeclarationNameAsString } from "../../utils/getTypeDeclarationNameAsString";

interface ResolvedTypeWithKeys {
    keys: string[];
    type: ResolvedType;
}

declare type TypeOrProperty = ResolvedTypeWithKeys | ObjectPropertyWithPath;

export const NoCyclicTypesRule: Rule = {
    name: "no-cyclic-types",
    // DISABLE_RULE: false,
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            definitionFile: {
                typeDeclaration: ({ typeName, declaration }, { relativeFilepath, contents }) => {
                    const name: string = getTypeDeclarationNameAsString(typeName);
                    const resolvedType: ResolvedType | undefined = typeResolver.resolveNamedType({
                        referenceToNamedType: name,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile: contents,
                            rootApiFile: workspace.definition.rootApiFile.contents,
                            casingsGenerator: CASINGS_GENERATOR
                        })
                    });

                    if (resolvedType == null) {
                        // invalid type. will be caught by another rule.
                        return [];
                    }

                    // pass on anything that isn't a named type
                    if (resolvedType._type !== "named") {
                        return [];
                    }

                    const seen = new Set<TypeName>();
                    seen.add(resolvedType.name.name.originalName as TypeName);

                    const cyclicType = findCyclicTypes({
                        originalTypeName: resolvedType.name.name.originalName as TypeName,
                        typeName: resolvedType.name.name.originalName as TypeName,
                        filepathOfDeclaration: relativeFilepath,
                        definitionFile: contents,
                        workspace,
                        typeResolver,
                        smartCasing: false,
                        seen
                    });

                    if (cyclicType != null) {
                        const fullPath = [resolvedType.name.name.originalName, ...cyclicType].join(" -> ");

                        return [
                            {
                                severity: "error",
                                message:
                                    cyclicType.length === 0
                                        ? "A type cannot reference itself"
                                        : `Circular type detected: ${fullPath}`
                            }
                        ];
                    }

                    return [];
                }
            }
        };
    }
};

// basic DFS to find types that reference themselves
function findCyclicTypes({
    originalTypeName,
    typeName,
    filepathOfDeclaration,
    definitionFile,
    workspace,
    typeResolver,
    smartCasing,
    seen
}: {
    originalTypeName: TypeName;
    typeName: TypeName;
    filepathOfDeclaration: RelativeFilePath;
    definitionFile: RawSchemas.DefinitionFileSchema;
    workspace: FernWorkspace;
    typeResolver: TypeResolver;
    smartCasing: boolean;
    seen: Set<TypeName>;
}): string[] | null {
    const fileContext: FernFileContext = constructFernFileContext({
        relativeFilepath: filepathOfDeclaration,
        definitionFile,
        rootApiFile: workspace.definition.rootApiFile.contents,
        casingsGenerator: CASINGS_GENERATOR
    });
    const resolvedType: ResolvedType | undefined = typeResolver.resolveType({
        type: typeName,
        file: fileContext
    });
    if (resolvedType == null) {
        return null;
    }

    const typeParams = [resolvedType]
        .flatMap((t: ResolvedType) => {
            switch (t._type) {
                case "container":
                    return unboxContainerTypes(t);
                case "named":
                    if (isRawObjectDefinition(t.declaration)) {
                        return getAllPropertiesForType({
                            typeName,
                            filepathOfDeclaration,
                            definitionFile,
                            workspace,
                            typeResolver,
                            smartCasing
                        }) as TypeOrProperty[];
                    }
                    return unboxUnionTypes(t, fileContext, typeResolver) as TypeOrProperty[];
                default:
                    return [];
            }
        })
        .flatMap(getTypeParams);

    for (const type of typeParams) {
        if (type == null) {
            continue;
        }

        if (type.filePath !== filepathOfDeclaration) {
            continue;
        }

        // we already check for cyclic imports, so we can skip cross-file checks
        if (originalTypeName === type.name) {
            return [...type.keys, type.name as string];
        }

        if (seen.has(type.name)) {
            continue;
        }
        seen.add(type.name);

        const foundType = findCyclicTypes({
            originalTypeName,
            typeName: type.name,
            filepathOfDeclaration: type.filePath,
            definitionFile,
            workspace,
            typeResolver,
            smartCasing,
            seen
        });
        if (foundType != null) {
            foundType.unshift(...type.keys, type.name);
            return foundType;
        }
    }
    return null;
}

function unboxUnionTypes(
    union: ResolvedType.Named,
    context: FernFileContext,
    typeResolver: TypeResolver
): TypeOrProperty[] {
    if (isRawDiscriminatedUnionDefinition(union.declaration)) {
        const declaration = union.declaration as RawSchemas.DiscriminatedUnionSchema;
        const u = declaration.union;
        const values = Object.values(u);
        const foundTypes: TypeOrProperty[] = [];
        values.forEach((value) => {
            if (typeof value === "string") {
                const resolvedType = typeResolver.resolveType({ type: value, file: context });
                if (resolvedType != null) {
                    if (resolvedType._type === "container") {
                        const unboxed = unboxContainerTypes(resolvedType, ["union", value]) as TypeOrProperty[];
                        foundTypes.push(...unboxed);
                    } else if (resolvedType._type === "named") {
                        foundTypes.push({
                            keys: ["union"],
                            type: resolvedType
                        });
                    }
                }
            } else if (value.type != null && typeof value.type === "string") {
                const resolvedType = typeResolver.resolveType({ type: value.type, file: context });
                if (resolvedType != null) {
                    if (resolvedType._type === "container") {
                        const unboxed = unboxContainerTypes(resolvedType, ["union", value.type]) as TypeOrProperty[];
                        foundTypes.push(...unboxed);
                    } else if (resolvedType._type === "named") {
                        foundTypes.push({
                            keys: ["union"],
                            type: resolvedType
                        });
                    }
                }
            }
        });
        return foundTypes;
    }
    if (isRawUndiscriminatedUnionDefinition(union.declaration)) {
        const declaration = union.declaration as RawSchemas.UndiscriminatedUnionSchema;
        return declaration.union
            .flatMap((singleUnion) => {
                if (typeof singleUnion === "string") {
                    const resolvedType = typeResolver.resolveType({
                        type: singleUnion,
                        file: context
                    });
                    if (resolvedType != null) {
                        if (resolvedType._type === "container") {
                            const unboxed = unboxContainerTypes(resolvedType, [
                                "union",
                                singleUnion
                            ]) as TypeOrProperty[];
                            return unboxed;
                        }
                        if (resolvedType._type === "named") {
                            return {
                                keys: ["union"],
                                type: resolvedType
                            };
                        }
                        return [];
                    }
                } else if (singleUnion.type != null) {
                    const resolvedType = typeResolver.resolveType({
                        type: singleUnion.type,
                        file: context
                    });
                    if (resolvedType != null) {
                        if (resolvedType._type === "container") {
                            const unboxed = unboxContainerTypes(resolvedType, [
                                "union",
                                singleUnion.type
                            ]) as TypeOrProperty[];
                            return unboxed;
                        }
                        if (resolvedType._type === "named") {
                            return {
                                keys: ["union"],
                                type: resolvedType
                            };
                        }
                        return [];
                    }
                }
                return null;
            })
            .filter((resolvedType) => resolvedType != null) as TypeOrProperty[];
    }
    return [];
}

function unboxContainerTypes(container: ResolvedType, keys: string[] = []): ResolvedTypeWithKeys[] {
    if (container._type !== "container") {
        return [];
    }
    return [container].flatMap((type) => {
        const output: ResolvedTypeWithKeys[] = [];
        switch (type.container._type) {
            case "literal":
                return output;
            case "map":
                if (type.container.keyType._type === "container") {
                    output.push(...unboxContainerTypes(type.container.keyType, [...keys, "key"]));
                } else {
                    output.push({ keys: [...keys, "key"], type: type.container.keyType as ResolvedType });
                }
                if (type.container.valueType._type === "container") {
                    output.push(...unboxContainerTypes(type.container.valueType, [...keys, "value"]));
                } else {
                    output.push({ keys: [...keys, "value"], type: type.container.valueType });
                }
                return output;
            default:
                if (type.container.itemType._type === "container") {
                    output.push(...unboxContainerTypes(type, [...keys, "items"]));
                } else {
                    output.push({ keys: [...keys, "items"], type: type.container.itemType });
                }
        }
        return output;
    });
}

function isObjectPropertyWithPath(typeOrProperty: TypeOrProperty): typeOrProperty is ObjectPropertyWithPath {
    return (typeOrProperty as ObjectPropertyWithPath).propertyType !== undefined;
}

function getTypeParams(t: TypeOrProperty): {
    keys: string[];
    name: TypeName;
    type: ResolvedType;
    filePath: RelativeFilePath;
} | null {
    if (isObjectPropertyWithPath(t)) {
        const property = t as ObjectPropertyWithPath;
        const name: string = property.name;
        const propertyType: TypeName = property.propertyType as TypeName;
        const type = property.resolvedPropertyType;
        const filePath: RelativeFilePath = property.filepathOfDeclaration;
        return { keys: [name], name: propertyType, type, filePath };
    } else {
        if ((t.type as ResolvedType)._type !== "named") {
            return null;
        }
        const type = t.type as ResolvedType.Named;
        const name: TypeName = type.name.name.originalName as TypeName;
        const filePath: RelativeFilePath = type.filepath;
        return { keys: t.keys, name, type, filePath };
    }
}
