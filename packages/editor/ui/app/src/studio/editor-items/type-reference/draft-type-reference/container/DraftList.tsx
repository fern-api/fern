import React, { useMemo } from "react";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { DraftParameterizedType, DraftTypeParameter } from "./parameterized-type/DraftParameterizedType";

export declare namespace DraftList {
    export interface Props {
        node: DraftTypeReferenceNode.ListType;
    }
}

export const DraftList: React.FC<DraftList.Props> = ({ node }) => {
    const typeParameters = useMemo(
        (): DraftTypeParameter[] => [
            {
                nodeId: node.itemType,
            },
        ],
        [node.itemType]
    );

    return <DraftParameterizedType nodeId={node.id} typeName="list" typeParameters={typeParameters} />;
};
