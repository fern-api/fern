import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useState } from "react";
import { PageItemsList } from "../../../../shared/page/PageItemsList";
import { UnionMember } from "./UnionMember";

export declare namespace UnionMembers {
    export interface Props {
        unionId: FernApiEditor.TypeId;
        shape: FernApiEditor.UnionShape;
    }
}

export const UnionMembers: React.FC<UnionMembers.Props> = ({ unionId, shape }) => {
    const [draftMember, setDraftMember] = useState<FernApiEditor.UnionMember>();
    const deleteDraft = useCallback(() => {
        setDraftMember(undefined);
    }, []);

    const onClickAddMember = useCallback(() => {
        setDraftMember({
            unionMemberId: EditorItemIdGenerator.unionMember(),
            discriminantValue: "",
        });
    }, []);

    const renderMemberRow = useCallback(
        (member: FernApiEditor.UnionMember, { isDraft }: { isDraft: boolean }) => {
            return (
                <UnionMember
                    key={member.unionMemberId}
                    unionId={unionId}
                    union={shape}
                    member={member}
                    onStopEditingDiscriminantValue={isDraft ? deleteDraft : undefined}
                    isDraft={isDraft}
                />
            );
        },
        [deleteDraft, shape, unionId]
    );

    return (
        <PageItemsList
            items={shape.members}
            draft={draftMember}
            renderItem={renderMemberRow}
            onClickAdd={onClickAddMember}
            addButtonText="Add member"
        />
    );
};
