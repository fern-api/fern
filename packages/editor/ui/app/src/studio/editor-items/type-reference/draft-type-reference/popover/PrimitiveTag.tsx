import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import { ChangeTypeTag } from "./ChangeTypeTag";

export declare namespace PrimitiveTag {
    export interface Props {
        primitiveType: FernApiEditor.PrimitiveType;
    }
}

export const PrimitiveTag: React.FC<PrimitiveTag.Props> = ({ primitiveType }) => {
    const { selectedNode } = useDraftTypeReferenceContext();
    const isSelected = selectedNode.type === "primitive" && selectedNode.primitive === primitiveType;

    const generateTree = useCallback(() => {
        return DraftTypeReferenceNode.primitive(primitiveType);
    }, [primitiveType]);

    return (
        <ChangeTypeTag
            label={getLabelForPrimitive(primitiveType)}
            isSelected={isSelected}
            generateTree={generateTree}
        />
    );
};

function getLabelForPrimitive(primitive: FernApiEditor.PrimitiveType): string {
    return primitive.visit({
        string: () => "string",
        boolean: () => "boolean",
        integer: () => "integer",
        long: () => "long",
        double: () => "double",
        dateTime: () => "datetime",
        uuid: () => "uuid",
        _other: (value) => {
            throw new Error("Unknown primitive type: " + value);
        },
    });
}
