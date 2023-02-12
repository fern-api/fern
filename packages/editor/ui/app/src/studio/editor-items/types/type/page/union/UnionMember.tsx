import { Button, EditableText } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { TwoColumnTable, TwoColumnTableRow } from "@fern-api/common-components";
import { useLocalTextState } from "@fern-api/react-commons";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../../../api-editor-context/ApiEditorContext";
import { EditableItemRow } from "../../../../shared/page/EditableItemRow";
import styles from "./UnionMember.module.scss";

export declare namespace UnionMember {
    export interface Props {
        unionId: FernApiEditor.TypeId;
        union: FernApiEditor.UnionShape;
        member: FernApiEditor.UnionMember;
        isDraft: boolean;
        onStopEditingDiscriminantValue?: () => void;
    }
}

export const UnionMember: React.FC<UnionMember.Props> = ({
    unionId,
    union,
    member,
    isDraft,
    onStopEditingDiscriminantValue,
}) => {
    const { submitTransaction } = useApiEditorContext();

    const onConfirmDiscriminantValue = useCallback(
        (newDiscriminantValue: string) => {
            const transaction = isDraft
                ? TransactionGenerator.createUnionMember({
                      unionId,
                      unionMemberId: member.unionMemberId,
                      discriminantValue: newDiscriminantValue,
                  })
                : TransactionGenerator.setUnionMemberDiscriminantValue({
                      unionId,
                      unionMemberId: member.unionMemberId,
                      discriminantValue: newDiscriminantValue,
                  });
            submitTransaction(transaction);
            onStopEditingDiscriminantValue?.();
        },
        [isDraft, member.unionMemberId, onStopEditingDiscriminantValue, submitTransaction, unionId]
    );

    const onClickDelete = useCallback(() => {
        submitTransaction(
            TransactionGenerator.deleteUnionMember({
                unionId,
                unionMemberId: member.unionMemberId,
            })
        );
    }, [member.unionMemberId, submitTransaction, unionId]);

    const localDiscriminantValue = useLocalTextState({
        persistedValue: member.discriminantValue,
        onCancelRename: onStopEditingDiscriminantValue,
        onRename: onConfirmDiscriminantValue,
        defaultIsRenaming: isDraft,
    });

    return (
        <EditableItemRow
            leftContent={
                <div className={styles.leftContent}>
                    <TwoColumnTable>
                        <TwoColumnTableRow label={`"${union.discriminant}":`}>
                            <EditableText {...localDiscriminantValue} placeholder="No value..." />
                        </TwoColumnTableRow>
                    </TwoColumnTable>
                    <Button text="Add property" icon={IconNames.PLUS} minimal />
                </div>
            }
            onDelete={onClickDelete}
        />
    );
};
