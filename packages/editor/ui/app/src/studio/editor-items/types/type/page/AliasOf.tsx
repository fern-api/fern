import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../../api-editor-context/ApiEditorContext";
import { EditableTypeReference } from "../../../type-reference/EditableTypeReference";
import styles from "./AliasOf.module.scss";

export declare namespace AliasOf {
    export interface Props {
        typeId: FernApiEditor.TypeId;
        shape: FernApiEditor.AliasShape;
    }
}

export const AliasOf: React.FC<AliasOf.Props> = ({ shape, typeId }) => {
    const { submitTransaction } = useApiEditorContext();

    const onChange = useCallback(
        (typeReference: FernApiEditor.TypeReference) => {
            submitTransaction(
                TransactionGenerator.setTypeShape({
                    typeId,
                    shape: FernApiEditor.Shape.alias({
                        aliasOf: typeReference,
                    }),
                })
            );
        },
        [submitTransaction, typeId]
    );

    return (
        <div className={styles.container}>
            <div>of</div>
            <div className={styles.typeReference}>
                <EditableTypeReference typeReference={shape.aliasOf} onChange={onChange} />
            </div>
        </div>
    );
};
