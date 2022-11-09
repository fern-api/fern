import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import styles from "./ChangeTypeReferencePopoverContent.module.scss";
import { ChangeTypeReferenceTag } from "./ChangeTypeReferenceTag";

export declare namespace ChangeTypeReferencePopoverContent {
    export interface Props {
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
    }
}

export const ChangeTypeReferencePopoverContent: React.FC<ChangeTypeReferencePopoverContent.Props> = ({ onChange }) => {
    const onClickTag = useCallback(() => {
        onChange(
            FernApiEditor.TypeReference.container(
                FernApiEditor.ContainerType.map({
                    keyType: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
                    valueType: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
                })
            )
        );
    }, [onChange]);

    return (
        <div className={styles.container}>
            <div className={styles.row}>
                <ChangeTypeReferenceTag label="string" onClick={onClickTag} />
                <ChangeTypeReferenceTag label="string" onClick={onClickTag} />
                <ChangeTypeReferenceTag label="string" onClick={onClickTag} />
                <ChangeTypeReferenceTag label="string" onClick={onClickTag} />
            </div>
        </div>
    );
};
