import { FernRegistry } from "@fern-fern/registry";
import React, { useMemo } from "react";
import { ContainerTypePreviewPart } from "./ContainerTypePreviewPart";

export declare namespace ListPreviewPart {
    export interface Props {
        list: FernRegistry.ListType;
        includeContainerItems: boolean;
    }
}

export const ListPreviewPart: React.FC<ListPreviewPart.Props> = ({ list, includeContainerItems }) => {
    const itemTypes = useMemo(() => [list.itemType], [list.itemType]);

    return (
        <ContainerTypePreviewPart
            containerName="list"
            itemTypes={itemTypes}
            includeContainerItems={includeContainerItems}
        />
    );
};
