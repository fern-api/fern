import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import styles from "./TypePreview.module.scss";

export declare namespace TypePreview {
    export interface Props {
        type: FernRegistry.Type;
        includeContainerItems?: boolean;
        className?: string;
    }
}

export const TypePreview: React.FC<TypePreview.Props> = ({ type, includeContainerItems = false, className }) => {
    const { resolveType } = useApiDefinitionContext();
    const previewString = useMemo(
        () => getTypePreviewString({ type, includeContainerItems, resolveType }),
        [type, includeContainerItems, resolveType]
    );
    return <span className={classNames(className, styles.container)}>{previewString}</span>;
};

function getTypePreviewString({
    type,
    includeContainerItems,
    resolveType,
}: {
    type: FernRegistry.Type;
    includeContainerItems: boolean;
    resolveType: (typeId: FernRegistry.TypeId) => FernRegistry.Type;
}): string {
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
        list: ({ itemType }) =>
            includeContainerItems
                ? "list<" + getTypePreviewString({ type: itemType, includeContainerItems, resolveType }) + ">"
                : "list",
        reference: (typeId) => getTypePreviewString({ type: resolveType(typeId), includeContainerItems, resolveType }),
        enum: () => "enum",
        union: () => "union",
        discriminatedUnion: () => "union",
        object: () => "object",
        optional: ({ itemType }) =>
            includeContainerItems
                ? "optional " + getTypePreviewString({ type: itemType, includeContainerItems, resolveType })
                : "optional",
        set: ({ itemType }) =>
            includeContainerItems
                ? "set<" + getTypePreviewString({ type: itemType, includeContainerItems, resolveType }) + ">"
                : "set",
        map: ({ keyType, valueType }) =>
            includeContainerItems
                ? "map<" +
                  getTypePreviewString({ type: keyType, includeContainerItems, resolveType }) +
                  ", " +
                  getTypePreviewString({ type: valueType, includeContainerItems, resolveType }) +
                  ">"
                : "map",
        unknown: () => "unknown",
        _other: () => "unknown",
    });
}
