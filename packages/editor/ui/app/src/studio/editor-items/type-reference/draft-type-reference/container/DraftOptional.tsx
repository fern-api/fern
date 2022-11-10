import React, { useMemo } from "react";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { DraftParameterizedType, DraftTypeParameter } from "./parameterized-type/DraftParameterizedType";

export declare namespace DraftOptional {
    export interface Props {
        node: DraftTypeReferenceNode.OptionalType;
    }
}

export const DraftOptional: React.FC<DraftOptional.Props> = ({ node }) => {
    const typeParameters = useMemo(
        (): DraftTypeParameter[] => [
            {
                nodeId: node.itemType,
            },
        ],
        [node.itemType]
    );

    return <DraftParameterizedType nodeId={node.id} typeName="optional" typeParameters={typeParameters} />;
};
