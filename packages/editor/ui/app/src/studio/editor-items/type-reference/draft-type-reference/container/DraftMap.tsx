import React, { useMemo } from "react";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { DraftParameterizedType, DraftTypeParameter } from "./parameterized-type/DraftParameterizedType";

export declare namespace DraftMap {
    export interface Props {
        node: DraftTypeReferenceNode.MapType;
    }
}

export const DraftMap: React.FC<DraftMap.Props> = ({ node }) => {
    const typeParameters = useMemo(
        (): DraftTypeParameter[] => [
            {
                nodeId: node.keyType,
            },
            {
                nodeId: node.valueType,
            },
        ],
        [node.keyType, node.valueType]
    );

    return <DraftParameterizedType nodeId={node.id} typeName="map" typeParameters={typeParameters} />;
};
