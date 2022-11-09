import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { STOP_PROPAGATION } from "@fern-ui/react-commons";
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
            <div
                className={styles.typeParameters}
                // so clicking on a type parameter doesn't open outer popovers
                onClick={STOP_PROPAGATION}
            >
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
