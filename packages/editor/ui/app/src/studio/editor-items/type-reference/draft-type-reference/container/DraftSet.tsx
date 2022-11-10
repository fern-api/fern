import React, { useMemo } from "react";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { DraftParameterizedType, DraftTypeParameter } from "./parameterized-type/DraftParameterizedType";

export declare namespace DraftSet {
    export interface Props {
        node: DraftTypeReferenceNode.SetType;
    }
}

export const DraftSet: React.FC<DraftSet.Props> = ({ node }) => {
    const typeParameters = useMemo(
        (): DraftTypeParameter[] => [
            {
                nodeId: node.itemType,
            },
        ],
        [node.itemType]
    );

    return <DraftParameterizedType nodeId={node.id} typeName="set" typeParameters={typeParameters} />;
};
