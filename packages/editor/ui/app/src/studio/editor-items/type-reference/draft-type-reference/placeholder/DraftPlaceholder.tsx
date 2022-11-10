import React from "react";
import { SelectableDraftTypeReference } from "../SelectableDraftTypeReference";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import styles from "./DraftPlaceholder.module.scss";

export declare namespace DraftPlaceholder {
    export interface Props {
        node: DraftTypeReferenceNode.Placeholder;
    }
}

export const DraftPlaceholder: React.FC<DraftPlaceholder.Props> = ({ node }) => {
    return (
        <SelectableDraftTypeReference nodeId={node.id} className={styles.placeholder}>
            <div>?</div>
        </SelectableDraftTypeReference>
    );
};
