import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useState } from "react";
import { MaybeDraftContainingList } from "../../../../../shared/MaybeDraftContainingList";
import { ObjectExtension } from "./ObjectExtension";
import styles from "./ObjectExtensions.module.scss";

export declare namespace ObjectExtensions {
    export interface Props {
        objectId: FernApiEditor.TypeId;
        shape: FernApiEditor.ObjectShape;
    }
}

interface DraftExtensionOf {
    extensionId: FernApiEditor.ObjectExtensionId;
    extensionOf: FernApiEditor.TypeId | undefined;
}

export const ObjectExtensions: React.FC<ObjectExtensions.Props> = ({ objectId, shape }) => {
    const [draftExtensionOf, setDraftExtensionOf] = useState<DraftExtensionOf>();
    const deleteDraft = useCallback(() => {
        setDraftExtensionOf(undefined);
    }, []);

    const onClickAddExtension = useCallback(() => {
        setDraftExtensionOf({
            extensionId: EditorItemIdGenerator.objectExtension(),
            extensionOf: undefined,
        });
    }, []);

    const renderExtensionRow = useCallback(
        (extension: FernApiEditor.ObjectExtension | DraftExtensionOf, { isDraft }: { isDraft: boolean }) => {
            return (
                <ObjectExtension
                    key={extension.extensionId}
                    objectId={objectId}
                    extensionId={extension.extensionId}
                    extensionOf={extension.extensionOf}
                    onDoneChangingType={isDraft ? deleteDraft : undefined}
                    isDraft={isDraft}
                />
            );
        },
        [deleteDraft, objectId]
    );

    return (
        <div className={styles.container}>
            <MaybeDraftContainingList
                items={shape.extensions}
                draft={draftExtensionOf}
                renderItem={renderExtensionRow}
            />
            {draftExtensionOf == null && (
                <div>
                    <Button text="Add extension" minimal icon={IconNames.PLUS} onClick={onClickAddExtension} />
                </div>
            )}
        </div>
    );
};
