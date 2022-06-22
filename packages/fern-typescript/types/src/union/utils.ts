import { Type, TypeReference } from "@fern-api/api";
import { ImportStrategy, ModelContext, ResolvedType, resolveType, TypeResolver } from "@fern-typescript/commons";
import { upperFirst } from "lodash";
import { SourceFile, ts } from "ts-morph";

// don't used named imports for type reference to prevent clashing with union subtypes
export const UNION_TYPE_MODEL_IMPORT_STRATEGY = ImportStrategy.TOP_PACKAGE_IMPORT;

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
    modelContext,
}: {
    valueType: TypeReference;
    typeResolver: TypeResolver;
    file: SourceFile;
    modelContext: ModelContext;
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
        type: modelContext.getReferenceToType({
            reference: valueType,
            referencedIn: file,
            importStrategy: UNION_TYPE_MODEL_IMPORT_STRATEGY,
        }),
    };
}

export function isTypeExtendable(resolvedType: ResolvedType): boolean {
    return resolvedType._type === "object";
}
