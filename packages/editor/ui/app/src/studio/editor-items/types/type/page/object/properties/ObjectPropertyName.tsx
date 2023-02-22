import { EditableText } from "@blueprintjs/core";
import { useLocalTextState } from "@fern-api/react-commons";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import styles from "./ObjectPropertyName.module.scss";

export declare namespace ObjectPropertyName {
    export interface Props {
        property: FernApiEditor.ObjectProperty;
        isDraft: boolean;
        onConfirm: (newName: string) => void;
        onCancel?: () => void;
    }
}

export const ObjectPropertyName: React.FC<ObjectPropertyName.Props> = ({ property, isDraft, onConfirm, onCancel }) => {
    const localLabel = useLocalTextState({
        persistedValue: property.propertyName,
        defaultIsRenaming: isDraft,
        onCancelRename: onCancel,
        onRename: onConfirm,
    });

    return <EditableText {...localLabel} className={styles.container} placeholder="property" />;
};
