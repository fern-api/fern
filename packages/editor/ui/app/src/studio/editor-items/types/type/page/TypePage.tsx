import { EditableText, H2 } from "@blueprintjs/core";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TwoColumnTable, TwoColumnTableRow } from "@fern-ui/common-components";
import React from "react";
import { TYPE_NAME_PLACEHOLDER } from "../placeholder";
import { TypeIcon } from "../TypeIcon";
import styles from "./TypePage.module.scss";
import { TypeShapeChooser } from "./TypeShapeChooser";
import { useLocalDescription } from "./useLocalDescription";
import { useLocalTypeName } from "./useLocalTypeName";

export declare namespace TypePage {
    export interface Props {
        type: FernApiEditor.Type;
    }
}

export const TypePage: React.FC<TypePage.Props> = ({ type }) => {
    const localTypeName = useLocalTypeName(type);
    const localDescription = useLocalDescription(type);

    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <TypeIcon large />
                <H2 className={styles.title}>
                    <EditableText {...localTypeName} placeholder={TYPE_NAME_PLACEHOLDER} />
                </H2>
            </div>
            <TwoColumnTable>
                <TwoColumnTableRow label="Description">
                    <EditableText
                        {...localDescription}
                        className={styles.description}
                        multiline
                        placeholder="Enter a description..."
                    ></EditableText>
                </TwoColumnTableRow>
                <TwoColumnTableRow label="Schema">
                    <TypeShapeChooser type={type} />
                </TwoColumnTableRow>
            </TwoColumnTable>
        </div>
    );
};
