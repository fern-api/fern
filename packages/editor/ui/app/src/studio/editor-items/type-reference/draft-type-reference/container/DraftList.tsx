import React, { useMemo } from "react";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import { DraftParameterizedType, DraftTypeParameter } from "./parameterized-type/DraftParameterizedType";

export declare namespace DraftList {
    export interface Props {
        node: DraftTypeReference.ListType;
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
