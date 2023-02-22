import { TwoColumnTable, TwoColumnTableRow } from "@fern-api/common-components";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../../../../api-editor-context/ApiEditorContext";
import { EditableItemRow } from "../../../../../shared/page/EditableItemRow";
import { EditableTypeReference } from "../../../../../type-reference/EditableTypeReference";
import { ObjectPropertyDescription } from "./ObjectPropertyDescription";
import { ObjectPropertyName } from "./ObjectPropertyName";

export declare namespace ObjectProperty {
    export interface Props {
        objectId: FernApiEditor.TypeId;
        property: FernApiEditor.ObjectProperty;
        isDraft: boolean;
        onStopRenaming?: () => void;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({ objectId, property, isDraft, onStopRenaming }) => {
    const { submitTransaction } = useApiEditorContext();

    const onRename = useCallback(
        (newPropertyName: string) => {
            const transaction = isDraft
                ? TransactionGenerator.createObjectProperty({
                      objectId,
                      propertyId: property.propertyId,
                      propertyName: newPropertyName,
                      propertyType: property.propertyType,
                  })
                : TransactionGenerator.renameObjectProperty({
                      objectId,
                      propertyId: property.propertyId,
                      newPropertyName,
                  });
            submitTransaction(transaction);
            onStopRenaming?.();
        },
        [isDraft, objectId, onStopRenaming, property.propertyId, property.propertyType, submitTransaction]
    );

    const onChangePropertyType = useCallback(
        (newPropertyType: FernApiEditor.TypeReference) => {
            submitTransaction(
                TransactionGenerator.setObjectPropertyType({
                    objectId,
                    propertyId: property.propertyId,
                    newPropertyType,
                })
            );
        },
        [objectId, property.propertyId, submitTransaction]
    );

    const onClickDelete = useCallback(() => {
        submitTransaction(
            TransactionGenerator.deleteObjectProperty({
                objectId,
                propertyId: property.propertyId,
            })
        );
    }, [objectId, property.propertyId, submitTransaction]);

    return (
        <EditableItemRow
            leftContent={
                <>
                    <ObjectPropertyName
                        property={property}
                        isDraft={isDraft}
                        onConfirm={onRename}
                        onCancel={onStopRenaming}
                    />
                    <EditableTypeReference typeReference={property.propertyType} onChange={onChangePropertyType} />
                </>
            }
            onDelete={onClickDelete}
        >
            <TwoColumnTable>
                <TwoColumnTableRow label="Description">
                    <ObjectPropertyDescription property={property} objectId={objectId} />
                </TwoColumnTableRow>
            </TwoColumnTable>
        </EditableItemRow>
    );
};
