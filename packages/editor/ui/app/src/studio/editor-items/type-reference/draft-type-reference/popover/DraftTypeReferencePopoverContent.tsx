import { Button, Divider, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TwoColumnTable, TwoColumnTableRow } from "@fern-ui/common-components";
import React, { useCallback } from "react";
import { TypeIcon } from "../../../types/type/TypeIcon";
import { useDraftTypeReferenceContext } from "../context/DraftTypeReferenceContext";
import { DraftTypeReferenceNode } from "../tree/DraftTypeReferenceNode";
import styles from "./DraftTypeReferencePopoverContent.module.scss";
import { ListTag } from "./ListTag";
import { MapTag } from "./MapTag";
import { OptionalTag } from "./OptionalTag";
import { PrimitiveTag } from "./PrimitiveTag";
import { SetTag } from "./SetTag";
import { TypeNameSuggest } from "./TypeNameSuggest";
import { UnknownTag } from "./UnknownTag";

export const DraftTypeReferencePopoverContent: React.FC = () => {
    const { selectedNode, replaceSelectedNode, onClickNext, onClickPrevious, onClickSave, onClickCancel } =
        useDraftTypeReferenceContext();

    const onSelectNamedType = useCallback(
        ({ typeId }: FernApiEditor.Type) => {
            replaceSelectedNode(DraftTypeReferenceNode.named(typeId));
        },
        [replaceSelectedNode]
    );

    return (
        <div className={styles.container}>
            <div className={styles.body}>
                <TwoColumnTable>
                    <TwoColumnTableRow label="Primitives" verticallyCenterLabel>
                        <div className={styles.row}>
                            <PrimitiveTag primitiveType={FernApiEditor.PrimitiveType.String} />
                            <PrimitiveTag primitiveType={FernApiEditor.PrimitiveType.Boolean} />
                            <PrimitiveTag primitiveType={FernApiEditor.PrimitiveType.Integer} />
                            <PrimitiveTag primitiveType={FernApiEditor.PrimitiveType.Long} />
                            <PrimitiveTag primitiveType={FernApiEditor.PrimitiveType.Double} />
                            <PrimitiveTag primitiveType={FernApiEditor.PrimitiveType.DateTime} />
                            <PrimitiveTag primitiveType={FernApiEditor.PrimitiveType.Uuid} />
                            <UnknownTag />
                        </div>
                    </TwoColumnTableRow>
                    <TwoColumnTableRow label="Containers" verticallyCenterLabel>
                        <div className={styles.row}>
                            <ListTag />
                            <SetTag />
                            <MapTag />
                            <OptionalTag />
                        </div>
                    </TwoColumnTableRow>
                    <TwoColumnTableRow label="Type" verticallyCenterLabel icon={<TypeIcon />}>
                        <TypeNameSuggest
                            selectedTypeId={selectedNode.type === "named" ? selectedNode.typeId : undefined}
                            onSelect={onSelectNamedType}
                        />
                    </TwoColumnTableRow>
                </TwoColumnTable>
            </div>
            <Divider className={styles.divider} />
            <div className={styles.footer}>
                <div className={styles.navigation}>
                    <Button
                        minimal
                        icon={IconNames.ARROW_LEFT}
                        onClick={onClickPrevious}
                        disabled={onClickPrevious == null}
                    />
                    <Button minimal icon={IconNames.ARROW_RIGHT} onClick={onClickNext} disabled={onClickNext == null} />
                </div>
                <div className={styles.footerButtons}>
                    <Button text="Cancel" minimal onClick={onClickCancel} />
                    <Button text="Save" intent={Intent.PRIMARY} onClick={onClickSave} />
                </div>
            </div>
        </div>
    );
};
