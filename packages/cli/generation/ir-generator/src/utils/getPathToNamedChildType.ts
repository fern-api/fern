import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    isRawDiscriminatedUnionDefinition,
    isRawObjectDefinition,
    isRawUndiscriminatedUnionDefinition,
    RawSchemas
} from "@fern-api/yaml-schema";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { ResolvedType } from "../resolvers/ResolvedType";
import { TypeResolver } from "../resolvers/TypeResolver";
import {
    CASINGS_GENERATOR,
    getAllPropertiesForType,
    ObjectPropertyWithPath,
    TypeName,
    TypePropertyArgs
} from "./getAllPropertiesForObject";

export declare type PathToNamedChildTypeArgs = TypePropertyArgs & {
    childName: TypeName;
    seen?: Set<TypeName>;
};

declare type TypeOrProperty = ResolvedTypeWithKeys | ObjectPropertyWithPath;

declare type UnionValue =
    | string
    | {
          docs?: string | undefined;
          name?: string | undefined;
          type?: string | Record<string, never> | undefined;
          key?: string | { value: string; name?: string | undefined } | undefined;
      };

interface ResolvedTypeWithKeys {
    keys: string[];
    type: ResolvedType;
}

interface TypeParams {
    keys: string[];
    name: TypeName;
    type: ResolvedType;
    filePath: RelativeFilePath;
}

/**
 * This function will return the first found path to a named child type from a given type. It will only search within the file of the given type.
 * @param args - The arguments to the function
 * @returns String array of keys and objects to the named child type, or null if not found
 */
export function getPathToNamedChildType(args: PathToNamedChildTypeArgs): string[] | null {
    const seen = args.seen ?? new Set<TypeName>([args.typeName]);
    const fileContext: FernFileContext = constructFernFileContext({
        relativeFilepath: args.filepathOfDeclaration,
        definitionFile: args.definitionFile,
        rootApiFile: args.workspace.definition.rootApiFile.contents,
        casingsGenerator: CASINGS_GENERATOR
    });
    const resolvedType: ResolvedType | undefined = args.typeResolver.resolveType({
        type: args.typeName,
        file: fileContext
    });
    if (resolvedType == null) {
        return null;
    }
    const firstIterationIsNotNamedType = seen.size === 1 && resolvedType._type !== "named";
    if (firstIterationIsNotNamedType) {
        return null;
    }

    const typeParams = getChildTypes(resolvedType, args, fileContext).flatMap(getTypeParams);

    for (const type of typeParams) {
        if (type == null || type.filePath !== args.filepathOfDeclaration) {
            continue;
        }
        // we already check for cyclic imports, so we can skip cross-file checks
        if (args.childName === type.name) {
            return [...type.keys, type.name as string];
        }
        if (seen.has(type.name)) {
            continue;
        }
        seen.add(type.name);

        const foundType = getPathToNamedChildType({
            childName: args.childName,
            typeName: type.name,
            filepathOfDeclaration: type.filePath,
            definitionFile: args.definitionFile,
            workspace: args.workspace,
            typeResolver: args.typeResolver,
            smartCasing: args.smartCasing,
            seen
        });
        if (foundType != null) {
            foundType.unshift(...type.keys, type.name);
            return foundType;
        }
    }
    return null;
}

function getChildTypes(
    t: ResolvedType,
    args: PathToNamedChildTypeArgs,
    fileContext: FernFileContext
): TypeOrProperty[] {
    switch (t._type) {
        case "container":
            return unboxContainerTypes(t);
        case "named":
            if (isRawObjectDefinition(t.declaration)) {
                return getAllPropertiesForType(args) as TypeOrProperty[];
            }
            return unboxUnionTypes(t, fileContext, args.typeResolver) as TypeOrProperty[];
        default:
            return [];
    }
}

function unboxUnionTypes(
    union: ResolvedType.Named,
    context: FernFileContext,
    typeResolver: TypeResolver
): TypeOrProperty[] {
    // helper for extracting typenames from union values
    const unboxUnionValue = (value: UnionValue) => (typeof value === "string" ? value : value.type);
    // helper for getting resolved types from union values
    const getUnionResolvedTypes = (unionValue: UnionValue): TypeOrProperty[] => {
        const value = unboxUnionValue(unionValue);
        if (typeof value === "string") {
            const resolvedType = typeResolver.resolveType({ type: value, file: context });
            if (resolvedType != null) {
                if (resolvedType._type === "container") {
                    return unboxContainerTypes(resolvedType, ["union", value]) as TypeOrProperty[];
                } else if (resolvedType._type === "named") {
                    return [{ keys: ["union"], type: resolvedType }];
                }
            }
        }
        return [] as TypeOrProperty[];
    };
    if (isRawDiscriminatedUnionDefinition(union.declaration)) {
        const declaration = union.declaration as RawSchemas.DiscriminatedUnionSchema;
        const u = declaration.union;
        const values = Object.values(u) as UnionValue[];
        return values.flatMap(getUnionResolvedTypes);
    }
    if (isRawUndiscriminatedUnionDefinition(union.declaration)) {
        const declaration = union.declaration as RawSchemas.UndiscriminatedUnionSchema;
        return declaration.union.flatMap(getUnionResolvedTypes);
    }
    return [];
}

function unboxContainerTypes(container: ResolvedType, keys: string[] = []): ResolvedTypeWithKeys[] {
    if (container._type !== "container") {
        return [];
    }
    const unboxResolvedType = (type: ResolvedType, k: string[]) => {
        if (type._type === "container") {
            return unboxContainerTypes(type, k);
        }
        return [
            {
                keys: k,
                type
            }
        ];
    };
    switch (container.container._type) {
        case "literal":
            return [] as ResolvedTypeWithKeys[];
        case "map":
            return [
                ...unboxResolvedType(container.container.keyType, [...keys, "key"]),
                ...unboxResolvedType(container.container.valueType, [...keys, "value"])
            ];
        default:
            return unboxResolvedType(container.container.itemType, [...keys, "items"]);
    }
}

function getTypeParams(t: TypeOrProperty): TypeParams | null {
    const isObjectProperty = (t as ObjectPropertyWithPath).propertyType !== undefined;
    if (isObjectProperty) {
        const property = t as ObjectPropertyWithPath;
        const name: string = property.name;
        const propertyType: TypeName = property.propertyType as TypeName;
        const type = property.resolvedPropertyType;
        const filePath: RelativeFilePath = property.filepathOfDeclaration;
        return { keys: [name], name: propertyType, type, filePath };
    } else {
        t = t as ResolvedTypeWithKeys;
        // we recursively unbox container types, so we only need to walk the remaining named types
        const isNotNamedType = t.type._type !== "named";
        if (isNotNamedType) {
            return null;
        }
        const type = t.type as ResolvedType.Named;
        const name: TypeName = type.name.name.originalName as TypeName;
        const filePath: RelativeFilePath = type.filepath;
        return { keys: t.keys, name, type, filePath };
    }
}
