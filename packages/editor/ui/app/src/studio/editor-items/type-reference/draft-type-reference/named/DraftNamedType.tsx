import React from "react";
import { useApiEditorContext } from "../../../../../api-editor-context/ApiEditorContext";
import { SelectableDraftTypeReference } from "../SelectableDraftTypeReference";
import { DraftTypeReference } from "../tree/DraftTypeReference";

export declare namespace DraftNamed {
    export interface Props {
        node: DraftTypeReference.NamedType;
    }
}

export const DraftNamed: React.FC<DraftNamed.Props> = ({ node }) => {
    const { definition } = useApiEditorContext();
    const type = definition.types[node.typeId];
    if (type == null) {
        throw new Error("Type does not exist: " + node.typeId);
    }

    return (
        <SelectableDraftTypeReference nodeId={node.id}>
            <div>{type.typeName}</div>
        </SelectableDraftTypeReference>
    );
};
