import React from "react";
import { SelectableDraftTypeReference } from "../SelectableDraftTypeReference";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";

export declare namespace DraftPrimitive {
    export interface Props {
        node: DraftTypeReferenceNode.PrimitiveType;
    }
}

export const DraftPrimitive: React.FC<DraftPrimitive.Props> = ({ node }) => {
    const textContent = node.primitive.visit({
        string: () => "string",
        integer: () => "integer",
        double: () => "double",
        long: () => "long",
        dateTime: () => "dateTime",
        uuid: () => "uuid",
        boolean: () => "boolean",
        _other: (value) => {
            throw new Error("Unknown PrimitiveType: " + value);
        },
    });

    return (
        <SelectableDraftTypeReference nodeId={node.id}>
            <div>{textContent}</div>
        </SelectableDraftTypeReference>
    );
};
