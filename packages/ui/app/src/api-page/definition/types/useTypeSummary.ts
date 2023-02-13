import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useApiContext } from "../../context/useApiContext";

export function useTypeSummary(type: FernRegistry.Type): string {
    const { resolveType } = useApiContext();
    return useMemo(() => getTypeSummary(type, resolveType), [type, resolveType]);
}

function getTypeSummary(
    type: FernRegistry.Type,
    resolveType: (typeId: FernRegistry.TypeId) => FernRegistry.Type
): string {
    return type._visit({
        primitive: (primitive) =>
            primitive._visit({
                string: () => "string",
                integer: () => "integer",
                double: () => "double",
                long: () => "long",
                boolean: () => "boolean",
                datetime: () => "ISO 8601 datetime",
                uuid: () => "uuid",
                _other: () => "unknown",
            }),
        list: ({ itemType }) => "list<" + getTypeSummary(itemType, resolveType) + ">",
        reference: (typeId) => getTypeSummary(resolveType(typeId), resolveType),
        enum: () => "enum",
        discriminatedUnion: () => "union",
        object: () => "object",
        optional: () => "optional " + getTypeSummary(type, resolveType),
        set: ({ itemType }) => "set<" + getTypeSummary(itemType, resolveType) + ">",
        map: ({ keyType, valueType }) =>
            "map<" + getTypeSummary(keyType, resolveType) + ", " + getTypeSummary(valueType, resolveType) + ">",
        unknown: () => "unknown",
        _other: () => "unknown",
    });
}
