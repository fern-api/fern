import React from "react";
import { SelectableDraftTypeReference } from "../SelectableDraftTypeReference";
import { DraftTypeReference } from "../tree/DraftTypeReference";

export declare namespace DraftUnknown {
    export interface Props {
        node: DraftTypeReference.UnknownType;
    }
}

export const DraftUnknown: React.FC<DraftUnknown.Props> = ({ node }) => {
    return (
        <SelectableDraftTypeReference nodeId={node.id}>
            <div>unknown</div>
        </SelectableDraftTypeReference>
    );
};
