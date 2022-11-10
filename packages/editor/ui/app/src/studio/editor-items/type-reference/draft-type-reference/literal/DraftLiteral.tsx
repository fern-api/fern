import React from "react";
import { SelectableDraftTypeReference } from "../SelectableDraftTypeReference";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";

export declare namespace DraftLiteral {
    export interface Props {
        node: DraftTypeReferenceNode.LiteralType;
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
