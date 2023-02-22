import { FernRegistry } from "@fern-fern/registry";
import React, { useMemo } from "react";
import { ContainerTypePreviewPart } from "./ContainerTypePreviewPart";

export declare namespace MapPreviewPart {
    export interface Props {
        map: FernRegistry.MapType;
        includeContainerItems: boolean;
    }
}

export const MapPreviewPart: React.FC<MapPreviewPart.Props> = ({ map, includeContainerItems }) => {
    const itemTypes = useMemo(() => [map.keyType, map.valueType], [map.keyType, map.valueType]);

    return (
        <ContainerTypePreviewPart
            containerName="map"
            itemTypes={itemTypes}
            includeContainerItems={includeContainerItems}
        />
    );
};
