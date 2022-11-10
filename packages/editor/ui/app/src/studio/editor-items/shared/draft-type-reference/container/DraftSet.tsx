import React, { useMemo } from "react";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import { DraftParameterizedType, DraftTypeParameter } from "./parameterized-type/DraftParameterizedType";

export declare namespace DraftSet {
    export interface Props {
        node: DraftTypeReference.SetType;
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
