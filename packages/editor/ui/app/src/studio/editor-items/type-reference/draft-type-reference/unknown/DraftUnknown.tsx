import React from "react";
import { SelectableDraftTypeReference } from "../SelectableDraftTypeReference";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";

export declare namespace DraftUnknown {
    export interface Props {
        node: DraftTypeReferenceNode.UnknownType;
    }
}

export const DraftUnknown: React.FC<DraftUnknown.Props> = ({ node }) => {
    return (
        <SelectableDraftTypeReference nodeId={node.id}>
            <div>unknown</div>
        </SelectableDraftTypeReference>
    );
};
