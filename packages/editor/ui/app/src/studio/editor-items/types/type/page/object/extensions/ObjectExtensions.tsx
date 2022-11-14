import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useState } from "react";
import { PageItemsList } from "../../../../../shared/page/PageItemsList";
import { ObjectExtension } from "./ObjectExtension";

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
        <PageItemsList
            items={shape.extensions}
            draft={draftExtensionOf}
            renderItem={renderExtensionRow}
            addButtonText="Add extension"
            onClickAdd={onClickAddExtension}
        />
    );
};
