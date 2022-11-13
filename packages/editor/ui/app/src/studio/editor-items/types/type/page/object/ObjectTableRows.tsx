import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TwoColumnTableRow } from "@fern-ui/common-components";
import React from "react";
import { ObjectExtensions } from "./extensions/ObjectExtensions";
import { ObjectProperties } from "./properties/ObjectProperties";

export declare namespace ObjectTableRows {
    export interface Props {
        objectId: FernApiEditor.TypeId;
        shape: FernApiEditor.ObjectShape;
    }
}

export const ObjectTableRows: React.FC<ObjectTableRows.Props> = ({ objectId, shape }) => {
    return (
        <>
            <TwoColumnTableRow label="Extensions">
                <ObjectExtensions objectId={objectId} shape={shape} />
            </TwoColumnTableRow>
            <TwoColumnTableRow label="Properties">
                <ObjectProperties objectId={objectId} shape={shape} />
            </TwoColumnTableRow>
        </>
    );
};
