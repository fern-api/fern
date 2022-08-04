import { TypeReference } from "@fern-fern/ir-model";
import { ImportStrategy } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { ResolvedType } from "@fern-typescript/resolvers";
import upperFirst from "lodash-es/upperFirst";
import { ts } from "ts-morph";

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
}: {
    valueType: TypeReference;
    file: File;
}): ResolvedSingleUnionValueType | undefined {
    const resolvedType = file.resolveTypeReference(valueType);
    if (resolvedType._type === "void") {
        return undefined;
    }

    return {
        isExtendable: isTypeExtendable(resolvedType),
        type: file.getReferenceToType(valueType),
    };
}

export function isTypeExtendable(resolvedType: ResolvedType): boolean {
    return resolvedType._type === "object";
}
