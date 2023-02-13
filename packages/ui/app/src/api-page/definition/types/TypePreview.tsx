import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useApiContext } from "../../context/useApiContext";

export declare namespace TypePreview {
    export interface Props {
        type: FernRegistry.Type;
        className?: string;
    }
}

export const TypePreview: React.FC<TypePreview.Props> = ({ type, className }) => {
    const { resolveType } = useApiContext();
    const previewString = useMemo(() => getTypePreviewString(type, resolveType), [type, resolveType]);
    return <span className={className}>{previewString}</span>;
};

function getTypePreviewString(
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
        list: ({ itemType }) => "list<" + getTypePreviewString(itemType, resolveType) + ">",
        reference: (typeId) => getTypePreviewString(resolveType(typeId), resolveType),
        enum: () => "enum",
        discriminatedUnion: () => "union",
        object: () => "object",
        optional: () => "optional " + getTypePreviewString(type, resolveType),
        set: ({ itemType }) => "set<" + getTypePreviewString(itemType, resolveType) + ">",
        map: ({ keyType, valueType }) =>
            "map<" +
            getTypePreviewString(keyType, resolveType) +
            ", " +
            getTypePreviewString(valueType, resolveType) +
            ">",
        unknown: () => "unknown",
        _other: () => "unknown",
    });
}
