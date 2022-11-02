import { Button, Divider, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import React, { useCallback } from "react";
import { useApiEditorContext } from "../../api-editor-context/ApiEditorContext";
import { SidebarItemIdGenerator } from "./ids/SidebarItemIdGenerator";
import { SidebarItemRow } from "./items/SidebarItemRow";
import { Packages } from "./packages/Packages";
import styles from "./Sidebar.module.scss";

export const Sidebar: React.FC = () => {
    const { submitTransaction } = useApiEditorContext();

    const onClickAddPackage = useCallback(() => {
        submitTransaction(
            TransactionGenerator.createPackage({
                packageId: EditorItemIdGenerator.package(),
                packageName: "my package",
            })
        );
    }, [submitTransaction]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.topSection}>
                <Button
                    className={styles.addResourceButton}
                    intent={Intent.PRIMARY}
                    icon={IconNames.BOX}
                    text="Add package"
                    onClick={onClickAddPackage}
                />
                <SidebarItemRow
                    itemId={SidebarItemIdGenerator.API_CONFIGURATION}
                    icon={IconNames.COG}
                    label="API Configuration"
                />
                <SidebarItemRow itemId={SidebarItemIdGenerator.SDKs} icon={IconNames.CODE_BLOCK} label="SDKs" />
            </div>
            <div className={styles.sidebarItems}>
                <Divider className={styles.divider} />
                <Packages />
            </div>
        </div>
    );
};
