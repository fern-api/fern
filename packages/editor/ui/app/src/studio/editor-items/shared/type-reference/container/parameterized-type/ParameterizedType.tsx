import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React from "react";
import { TypeReference } from "../../TypeReference";
import styles from "./ParameterizedType.module.scss";

export interface TypeParameter {
    shape: FernApiEditor.TypeReference;
    onChange: (typeReference: FernApiEditor.TypeReference) => void;
}

export declare namespace ParameterizedType {
    export interface Props {
        typeName: string;
        typeParameters: TypeParameter[];
    }
}

export const ParameterizedType: React.FC<ParameterizedType.Props> = ({ typeName, typeParameters }) => {
    return (
        <div className={styles.container}>
            <div>{`${typeName}[`}</div>
            <div className={styles.typeParameters}>
                {typeParameters.map((typeParameter, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <div>,</div>}
                        <TypeReference typeReference={typeParameter.shape} onChange={typeParameter.onChange} />
                    </React.Fragment>
                ))}
            </div>
            <div>{"]"}</div>
        </div>
    );
};
