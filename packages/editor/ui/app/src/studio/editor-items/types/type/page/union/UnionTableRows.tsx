import { TwoColumnTableRow } from "@fern-api/common-components";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React from "react";
import { UnionDiscriminant } from "./UnionDiscriminant";
import { UnionMembers } from "./UnionMembers";

export declare namespace UnionTableRows {
    export interface Props {
        unionId: FernApiEditor.TypeId;
        shape: FernApiEditor.UnionShape;
    }
}

export const UnionTableRows: React.FC<UnionTableRows.Props> = ({ unionId, shape }) => {
    return (
        <>
            <TwoColumnTableRow label="Discriminant">
                <UnionDiscriminant unionId={unionId} shape={shape} />
            </TwoColumnTableRow>
            <TwoColumnTableRow label="Members">
                <UnionMembers unionId={unionId} shape={shape} />
            </TwoColumnTableRow>
        </>
    );
};
