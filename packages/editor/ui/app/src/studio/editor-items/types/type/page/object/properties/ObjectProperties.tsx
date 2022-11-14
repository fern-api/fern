import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useState } from "react";
import { PageItemsList } from "../../../../../shared/page/PageItemsList";
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
        <PageItemsList
            items={shape.properties}
            draft={draftProperty}
            renderItem={renderPropertyRow}
            addButtonText="Add property"
            onClickAdd={onClickAddProperty}
        />
    );
};
