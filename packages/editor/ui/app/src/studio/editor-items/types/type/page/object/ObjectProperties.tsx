import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useState } from "react";
import { MaybeDraftContainingList } from "../../../../shared/MaybeDraftContainingList";
import styles from "./ObjectProperties.module.scss";
import { ObjectProperty } from "./ObjectProperty";

export declare namespace ObjectProperties {
    export interface Props {
        objectId: FernApiEditor.TypeId;
        shape: FernApiEditor.ObjectShape;
    }
}

export const ObjectProperties: React.FC<ObjectProperties.Props> = ({ objectId, shape }) => {
    const [draftProperty, setDraftProperty] = useState<FernApiEditor.ObjectProperty>();
    const deleteDraft = useCallback(() => {
        setDraftProperty(undefined);
    }, []);

    const onClickAddProperty = useCallback(() => {
        setDraftProperty({
            propertyId: EditorItemIdGenerator.objectProperty(),
            propertyName: "",
            propertyType: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
        });
    }, []);

    const renderPropertyRow = useCallback(
        (property: FernApiEditor.ObjectProperty, { isDraft }: { isDraft: boolean }) => {
            return (
                <ObjectProperty
                    key={property.propertyId}
                    objectId={objectId}
                    property={property}
                    onStopRenaming={isDraft ? deleteDraft : undefined}
                    isDraft={isDraft}
                />
            );
        },
        [deleteDraft, objectId]
    );

    return (
        <div className={styles.container}>
            <MaybeDraftContainingList items={shape.properties} draft={draftProperty} renderItem={renderPropertyRow} />
            <div>
                <Button text="Add property" minimal icon={IconNames.PLUS} onClick={onClickAddProperty} />
            </div>
        </div>
    );
};
