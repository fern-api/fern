import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import styles from "./TypePreview.module.scss";
import { TypePreviewPart } from "./TypePreviewPart";

export declare namespace TypePreview {
    export interface Props {
        type: FernRegistry.Type;
        includeContainerItems?: boolean;
    }
}

export const TypePreview: React.FC<TypePreview.Props> = ({ type, includeContainerItems = false }) => {
    return (
        <span className={styles.container}>
            <TypePreviewPart type={type} includeContainerItems={includeContainerItems} />
        </span>
    );
};
