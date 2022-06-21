import { Type, TypeReference } from "@fern-api/api";
import { getTypeReference, ResolvedType, resolveType, TypeResolver } from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { Directory, SourceFile, ts } from "ts-morph";

// import the entire model as a namespace to prevent clashing with union subtypes
export const FORCE_USE_MODEL_NAMESPACE_IMPORT_FOR_UNION_TYPES = true;

export function getKeyForUnion({ discriminantValue }: ResolvedSingleUnionType): string {
    return upperFirst(discriminantValue);
}

export interface ResolvedSingleUnionType {
    docs: string | null | undefined;
    discriminantValue: string;
    valueType: ResolvedSingleUnionValueType | undefined;
}

export interface ResolvedSingleUnionValueType {
    type: ts.TypeNode;
    isExtendable: boolean;
}

export function getResolvedValueTypeForSingleUnionType({
    valueType,
    typeResolver,
    file,
    modelDirectory,
}: {
    valueType: TypeReference;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelDirectory: Directory;
}): ResolvedSingleUnionValueType | undefined {
    const resolvedType =
        valueType._type === "named"
            ? typeResolver.resolveTypeName(valueType)
            : resolveType(
                  Type.alias({
                      aliasOf: valueType,
                  }),
                  (typeName) => typeResolver.resolveTypeName(typeName)
              );

    if (resolvedType._type === "void") {
        return undefined;
    }

    return {
        isExtendable: isTypeExtendable(resolvedType),
        type: getTypeReference({
            reference: valueType,
            referencedIn: file,
            modelDirectory,
            forceUseNamespaceImport: FORCE_USE_MODEL_NAMESPACE_IMPORT_FOR_UNION_TYPES,
        }),
    };
}

export function isTypeExtendable(resolvedType: ResolvedType): boolean {
    return resolvedType._type === "object";
}
