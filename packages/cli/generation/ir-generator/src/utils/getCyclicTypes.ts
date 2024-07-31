import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    isRawDiscriminatedUnionDefinition,
    isRawObjectDefinition,
    isRawUndiscriminatedUnionDefinition,
    RawSchemas
} from "@fern-api/yaml-schema";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { isNamedType, ResolvedType } from "../resolvers/ResolvedType";
import { TypeResolver } from "../resolvers/TypeResolver";
import {
    CASINGS_GENERATOR,
    getAllPropertiesForType,
    ObjectPropertyWithPath,
    TypeName,
    TypePropertyArgs
} from "./getAllPropertiesForObject";

export declare type CyclicTypeArgs = TypePropertyArgs & {
    childName: TypeName;
    seen?: Set<TypeName>;
};

declare type TypeOrProperty = ResolvedTypeWithKeys | ObjectPropertyWithPath;

function isObjectProperty(TypeOrProperty: TypeOrProperty): TypeOrProperty is ObjectPropertyWithPath {
    return "propertyType" in TypeOrProperty;
}

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
    type: ResolvedType | null;
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
export function getCyclicTypes(args: CyclicTypeArgs): string[] | null {
    args.seen ??= new Set<TypeName>([args.typeName]);
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
    if (resolvedType._type !== "named") {
        return null;
    }

    // If this is a union type, every object path must be cyclic in order for the type to be considered an invalid cyclic type. This is also why we ignore container types, since they can be empty.
    const isUnion =
        isRawDiscriminatedUnionDefinition(resolvedType.declaration) ||
        isRawUndiscriminatedUnionDefinition(resolvedType.declaration);

    const typeProperties: TypeOrProperty[] = isUnion
        ? unboxUnionTypes(resolvedType, fileContext, args.typeResolver)
        : unboxObjectType(args, resolvedType);

    return isUnion
        ? checkUnionChildTypes(args, typeProperties.flatMap(getTypeParams))
        : checkObjectChildTypes(args, typeProperties.flatMap(getTypeParams));
}

function unboxObjectType(args: CyclicTypeArgs, t: ResolvedType.Named): TypeOrProperty[] {
    if (isRawObjectDefinition(t.declaration)) {
        return getAllPropertiesForType(args);
    }
    return [];
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
                return [{ keys: ["union"], type: resolvedType }];
            }
        }
        return [{ keys: ["union"], type: null }];
    };
    if (isRawDiscriminatedUnionDefinition(union.declaration)) {
        const declaration = union.declaration as RawSchemas.DiscriminatedUnionSchema;
        const u = declaration.union;
        const values = Object.values(u) as UnionValue[];
        return values.flatMap(getUnionResolvedTypes);
    } else if (isRawUndiscriminatedUnionDefinition(union.declaration)) {
        const declaration = union.declaration as RawSchemas.UndiscriminatedUnionSchema;
        return declaration.union.flatMap(getUnionResolvedTypes);
    }
    return [];
}

function getTypeParams(t: TypeOrProperty): TypeParams | null {
    if (isObjectProperty(t)) {
        const name: string = t.name;
        const propertyType: TypeName = t.propertyType as TypeName;
        const type = t.resolvedPropertyType;
        const filePath: RelativeFilePath = t.filepathOfDeclaration;
        return { keys: [name], name: propertyType, type, filePath };
    } else {
        const type = t.type;
        if (type == null || !isNamedType(type)) {
            return null;
        }
        const name: TypeName = type.name.name.originalName as TypeName;
        const filePath: RelativeFilePath = type.filepath;
        return { keys: t.keys, name, type, filePath };
    }
}

function checkChildType(args: CyclicTypeArgs, type: TypeParams | null): string[] | null {
    if (args.seen == null || type == null || !isNamedType(type.type) || type.filePath !== args.filepathOfDeclaration) {
        return null;
    }
    if (args.childName === type.name) {
        return [...type.keys, type.name as string];
    }
    if (args.seen.has(type.name)) {
        return null;
    }
    args.seen.add(type.name);
    const foundType = getCyclicTypes({
        childName: args.childName,
        typeName: type.name,
        filepathOfDeclaration: type.filePath,
        definitionFile: args.definitionFile,
        workspace: args.workspace,
        typeResolver: args.typeResolver,
        smartCasing: args.smartCasing,
        seen: args.seen
    });
    if (foundType != null) {
        foundType.unshift(...type.keys, type.name);
        return foundType;
    }
    return null;
}

function checkObjectChildTypes(args: CyclicTypeArgs, typeParams: (TypeParams | null)[]): string[] | null {
    if (args.seen == null) {
        return null;
    }
    for (const type of typeParams) {
        const foundPath = checkChildType(args, type);
        if (foundPath != null) {
            return foundPath;
        }
    }
    return null;
}

function checkUnionChildTypes(args: CyclicTypeArgs, typeParams: (TypeParams | null)[]): string[] | null {
    if (args.seen == null) {
        return null;
    }
    let foundPath: string[] | null = null;
    for (const type of typeParams) {
        foundPath = checkChildType(args, type);
        if (foundPath == null) {
            return null;
        }
    }
    return foundPath;
}
