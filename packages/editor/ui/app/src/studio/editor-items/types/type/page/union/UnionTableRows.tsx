import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TwoColumnTableRow } from "@fern-ui/common-components";
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
