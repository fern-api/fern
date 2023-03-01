import { STOP_PROPAGATION } from "@fern-api/react-commons";
import React from "react";
import { DraftTypeReferenceContent } from "../../DraftTypeReferenceContent";
import { SelectableDraftTypeReference } from "../../SelectableDraftTypeReference";
import { DraftTypeReferenceNodeId } from "../../tree/DraftTypeReferenceNodeId";
import styles from "./DraftParameterizedType.module.scss";

export interface DraftTypeParameter {
    nodeId: DraftTypeReferenceNodeId;
}

export declare namespace DraftParameterizedType {
    export interface Props {
        typeName: string;
        nodeId: DraftTypeReferenceNodeId;
        typeParameters: DraftTypeParameter[];
    }
}

export const DraftParameterizedType: React.FC<DraftParameterizedType.Props> = ({
    nodeId,
    typeName,
    typeParameters,
}) => {
    return (
        <SelectableDraftTypeReference nodeId={nodeId} isContainer>
            <div>{`${typeName}<`}</div>
            <div
                className={styles.typeParameters}
                // so we don't select the outer type while in between type parameters
                // (e.g. hovering over the comma)
                onMouseOver={STOP_PROPAGATION}
            >
                {typeParameters.map((typeParameter, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <div>,</div>}
                        <DraftTypeReferenceContent nodeId={typeParameter.nodeId} />
                    </React.Fragment>
                ))}
            </div>
            <div>{">"}</div>
        </SelectableDraftTypeReference>
    );
};
