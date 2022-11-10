import React from "react";
import { SelectableDraftTypeReference } from "../SelectableDraftTypeReference";
import { DraftTypeReference } from "../tree/DraftTypeReference";

export declare namespace DraftLiteral {
    export interface Props {
        node: DraftTypeReference.LiteralType;
    }
}

export const DraftLiteral: React.FC<DraftLiteral.Props> = ({ node }) => {
    const textContent = node.literal._visit({
        string: (value) => `"${value}"`,
        _other: ({ type }) => {
            throw new Error("Unknown LiteralType: " + type);
        },
    });

    return (
        <SelectableDraftTypeReference nodeId={node.id}>
            <div>{textContent}</div>
        </SelectableDraftTypeReference>
    );
};
