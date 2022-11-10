import React from "react";
import { SelectableDraftTypeReference } from "../SelectableDraftTypeReference";
import { DraftTypeReference } from "../tree/DraftTypeReference";
import styles from "./DraftPlaceholder.module.scss";

export declare namespace DraftPlaceholder {
    export interface Props {
        node: DraftTypeReference.Placeholder;
    }
}

export const DraftPlaceholder: React.FC<DraftPlaceholder.Props> = ({ node }) => {
    return (
        <SelectableDraftTypeReference nodeId={node.id} className={styles.placeholder}>
            <div>?</div>
        </SelectableDraftTypeReference>
    );
};
