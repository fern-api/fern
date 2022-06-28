import { TypeReference } from "@fern-fern/ir-model";
import { ImportStrategy } from "@fern-typescript/commons";
import { ModelContext, ResolvedType } from "@fern-typescript/model-context";
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
    file,
    modelContext,
}: {
    valueType: TypeReference;
    file: SourceFile;
    modelContext: ModelContext;
}): ResolvedSingleUnionValueType | undefined {
    const resolvedType = modelContext.resolveTypeReference(valueType);
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
