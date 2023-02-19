import { FernRegistry } from "@fern-fern/registry";
import React, { useMemo } from "react";
import { ContainerTypePreviewPart } from "./ContainerTypePreviewPart";

export declare namespace OptionalPreviewPart {
    export interface Props {
        optional: FernRegistry.OptionalType;
        includeContainerItems: boolean;
    }
}

export const OptionalPreviewPart: React.FC<OptionalPreviewPart.Props> = ({ optional, includeContainerItems }) => {
    const itemTypes = useMemo(() => [optional.itemType], [optional.itemType]);

    return (
        <ContainerTypePreviewPart
            containerName="optional"
            itemTypes={itemTypes}
            includeContainerItems={includeContainerItems}
        />
    );
};
