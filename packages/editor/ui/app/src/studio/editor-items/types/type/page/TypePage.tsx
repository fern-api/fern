import { EditableText, H2 } from "@blueprintjs/core";
import { TwoColumnTable, TwoColumnTableRow } from "@fern-api/common-components";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React from "react";
import { TYPE_NAME_PLACEHOLDER } from "../placeholder";
import { TypeIcon } from "../TypeIcon";
import { AliasSchemaRow } from "./alias/AliasSchemaRow";
import { ObjectTableRows } from "./object/ObjectTableRows";
import styles from "./TypePage.module.scss";
import { TypeShapeChooser } from "./TypeShapeChooser";
import { UnionTableRows } from "./union/UnionTableRows";
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
            <EditableText {...localDescription} multiline placeholder="Enter a description..."></EditableText>
            <TwoColumnTable>
                <TwoColumnTableRow label="Schema" verticallyCenterLabel>
                    <TypeShapeChooser type={type} />
                    {type.shape._visit({
                        alias: (shape) => <AliasSchemaRow shape={shape} typeId={type.typeId} />,
                        enum: () => null,
                        object: () => null,
                        union: () => null,
                        _other: ({ type }) => {
                            throw new Error("Unknown shape type: " + type);
                        },
                    })}
                </TwoColumnTableRow>
                {type.shape._visit({
                    alias: () => null,
                    enum: () => null,
                    object: (shape) => <ObjectTableRows objectId={type.typeId} shape={shape} />,
                    union: (shape) => <UnionTableRows unionId={type.typeId} shape={shape} />,
                    _other: ({ type }) => {
                        throw new Error("Unknown shape type: " + type);
                    },
                })}
            </TwoColumnTable>
        </div>
    );
};
