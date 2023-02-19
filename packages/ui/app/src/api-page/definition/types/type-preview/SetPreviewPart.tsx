import { FernRegistry } from "@fern-fern/registry";
import React, { useMemo } from "react";
import { ContainerTypePreviewPart } from "./ContainerTypePreviewPart";

export declare namespace SetPreviewPart {
    export interface Props {
        set: FernRegistry.SetType;
        includeContainerItems: boolean;
    }
}

export const SetPreviewPart: React.FC<SetPreviewPart.Props> = ({ set, includeContainerItems }) => {
    const itemTypes = useMemo(() => [set.itemType], [set.itemType]);

    return (
        <ContainerTypePreviewPart
            containerName="set"
            itemTypes={itemTypes}
            includeContainerItems={includeContainerItems}
        />
    );
};
