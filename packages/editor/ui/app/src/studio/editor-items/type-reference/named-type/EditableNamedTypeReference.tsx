import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback, useState } from "react";
import styles from "./EditableNamedTypeReference.module.scss";
import { NamedTypePreview } from "./NamedTypePreview";
import { TypeNameSuggest } from "./TypeNameSuggest";

export declare namespace EditableNamedTypeReference {
    export interface Props {
        typeId: FernApiEditor.TypeId | undefined;
        onChange: (type: FernApiEditor.TypeId) => void;
        onClickCancel?: () => void;
        onClosePopover?: (type: FernApiEditor.Type | undefined) => void;
    }
}

interface DraftTypeId {
    typeId: FernApiEditor.TypeId | undefined;
}

export const EditableNamedTypeReference: React.FC<EditableNamedTypeReference.Props> = ({
    typeId,
    onChange,
    onClickCancel,
}) => {
    const [draftTypeId, setDraftTypeId] = useState<DraftTypeId | undefined>(typeId != null ? undefined : { typeId });

    const onClickEdit = useCallback(() => {
        setDraftTypeId({ typeId });
    }, [typeId]);

    const onChangeDraft = useCallback(({ typeId }: FernApiEditor.Type) => {
        setDraftTypeId({ typeId });
    }, []);

    const handleClickCancel = useCallback(() => {
        setDraftTypeId(undefined);
        onClickCancel?.();
    }, [onClickCancel]);

    const onClickSave = useCallback(() => {
        if (draftTypeId?.typeId != null && draftTypeId.typeId !== typeId) {
            onChange(draftTypeId.typeId);
        }
        setDraftTypeId(undefined);
    }, [draftTypeId?.typeId, onChange, typeId]);

    return (
        <div className={styles.container}>
            {draftTypeId != null ? (
                <>
                    <TypeNameSuggest selectedTypeId={draftTypeId.typeId} onSelect={onChangeDraft} defaultIsOpen />
                    <Button minimal icon={IconNames.CROSS} intent={Intent.DANGER} onClick={handleClickCancel} />
                    <Button
                        minimal
                        icon={IconNames.TICK}
                        intent={Intent.SUCCESS}
                        onClick={onClickSave}
                        disabled={draftTypeId.typeId == null}
                    />
                </>
            ) : (
                <>
                    {typeId != null ? <NamedTypePreview typeId={typeId} /> : <i>No type</i>}
                    <Button minimal icon={IconNames.EDIT} onClick={onClickEdit} />
                </>
            )}
        </div>
    );
};
