import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TwoColumnTable, TwoColumnTableRow } from "@fern-ui/common-components";
import { useBooleanState } from "@fern-ui/react-commons";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../../../api-editor-context/ApiEditorContext";
import { EditableTypeReference } from "../../../../type-reference/EditableTypeReference";
import styles from "./ObjectProperty.module.scss";
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

    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(true);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Button
                        icon={isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN}
                        onClick={toggleIsCollapsed}
                        minimal
                    />
                    <ObjectPropertyName
                        property={property}
                        isDraft={isDraft}
                        onConfirm={onRename}
                        onCancel={onStopRenaming}
                    />
                    <EditableTypeReference typeReference={property.propertyType} onChange={onChangePropertyType} />
                </div>
                <div className={styles.headerActions}>
                    <Button icon={IconNames.TRASH} intent={Intent.DANGER} minimal onClick={onClickDelete} />
                </div>
            </div>

            {isCollapsed || (
                <div className={styles.details}>
                    <TwoColumnTable>
                        <TwoColumnTableRow label="Description">
                            <ObjectPropertyDescription property={property} objectId={objectId} />
                        </TwoColumnTableRow>
                    </TwoColumnTable>
                </div>
            )}
        </div>
    );
};
