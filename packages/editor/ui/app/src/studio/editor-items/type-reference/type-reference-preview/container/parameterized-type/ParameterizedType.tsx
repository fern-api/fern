import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React from "react";
import { TypeReferencePreview } from "../../TypeReferencePreview";
import styles from "./ParameterizedType.module.scss";

export declare namespace ParameterizedType {
    export interface Props {
        typeName: string;
        typeParameters: FernApiEditor.TypeReference[];
    }
}

export const ParameterizedType: React.FC<ParameterizedType.Props> = ({ typeName, typeParameters }) => {
    return (
        <div className={styles.container}>
            <div>{`${typeName}<`}</div>
            <div className={styles.typeParameters}>
                {typeParameters.map((typeParameter, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <div>,</div>}
                        <TypeReferencePreview typeReference={typeParameter} />
                    </React.Fragment>
                ))}
            </div>
            <div>{">"}</div>
        </div>
    );
};
