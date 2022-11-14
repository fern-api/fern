import { EditableText } from "@blueprintjs/core";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useLocalTextState } from "@fern-ui/react-commons";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../../../api-editor-context/ApiEditorContext";
import { MonospaceText } from "../../../../type-reference/MonospaceText";

export declare namespace UnionDiscriminant {
    export interface Props {
        unionId: FernApiEditor.TypeId;
        shape: FernApiEditor.UnionShape;
    }
}

export const UnionDiscriminant: React.FC<UnionDiscriminant.Props> = ({ unionId, shape }) => {
    const { submitTransaction } = useApiEditorContext();

    const onConfirm = useCallback(
        (newDiscriminant: string) => {
            submitTransaction(
                TransactionGenerator.setUnionDiscriminant({
                    unionId,
                    discriminant: newDiscriminant,
                })
            );
        },
        [submitTransaction, unionId]
    );

    const localLabel = useLocalTextState({
        persistedValue: shape.discriminant,
        onRename: onConfirm,
    });

    return (
        <MonospaceText>
            <EditableText
                {...localLabel}
                value={localLabel.isEditing ? localLabel.value : `"${localLabel.value}"`}
                placeholder="Discriminant..."
            />
        </MonospaceText>
    );
};
