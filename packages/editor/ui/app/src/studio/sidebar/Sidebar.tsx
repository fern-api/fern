import { Button, Divider, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import React, { useCallback } from "react";
import { useSidebarContext } from "./context/useSidebarContext";
import { SidebarItemIdGenerator } from "./ids/SidebarItemIdGenerator";
import { Packages } from "./packages/Packages";
import { NonEditableSidebarItemRow } from "./row/non-editable-row/NonEditableSidebarItemRow";
import styles from "./Sidebar.module.scss";
import { useSelectionReset } from "./useSelectionReset";

export const Sidebar: React.FC = () => {
    const { setDraft } = useSidebarContext();

    useSelectionReset();

    const onClickAddPackage = useCallback(() => {
        setDraft({
            type: "package",
            packageId: EditorItemIdGenerator.package(),
            parent: undefined,
        });
    }, [setDraft]);

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
                <NonEditableSidebarItemRow
                    itemId={SidebarItemIdGenerator.API_CONFIGURATION}
                    icon={IconNames.COG}
                    label="API Configuration"
                />
                <NonEditableSidebarItemRow
                    itemId={SidebarItemIdGenerator.SDKs}
                    icon={IconNames.CODE_BLOCK}
                    label="SDKs"
                />
            </div>
            <div className={styles.sidebarItems}>
                <Divider className={styles.divider} />
                <Packages />
            </div>
        </div>
    );
};
