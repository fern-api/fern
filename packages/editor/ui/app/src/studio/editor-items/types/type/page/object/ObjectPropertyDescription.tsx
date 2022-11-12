import { EditableText } from "@blueprintjs/core";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useLocalTextState } from "@fern-ui/react-commons";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../../../api-editor-context/ApiEditorContext";
import styles from "./ObjectPropertyDescription.module.scss";

export declare namespace ObjectPropertyDescription {
    export interface Props {
        objectId: FernApiEditor.TypeId;
        property: FernApiEditor.ObjectProperty;
    }
}

export const ObjectPropertyDescription: React.FC<ObjectPropertyDescription.Props> = ({ property, objectId }) => {
    const { submitTransaction } = useApiEditorContext();

    const onConfirm = useCallback(
        (newPropertyDescription: string) => {
            submitTransaction(
                TransactionGenerator.setObjectPropertyDescription({
                    objectId,
                    propertyId: property.propertyId,
                    newPropertyDescription,
                })
            );
        },
        [objectId, property.propertyId, submitTransaction]
    );

    const localLabel = useLocalTextState({
        persistedValue: property.description ?? "",
        onRename: onConfirm,
    });

    return <EditableText {...localLabel} className={styles.fill} placeholder="Property description..." multiline />;
};
