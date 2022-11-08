import { Button, Divider, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React, { useCallback, useEffect } from "react";
import { PackageIcon } from "../editor-items/packages/package/PackageIcon";
import { useCreateDraftPackage } from "../editor-items/packages/package/sidebar/useCreateDraftPackage";
import { Packages } from "../editor-items/packages/packages-list/RootPackages";
import { useSelectedSidebarItemId } from "../routes/useSelectedSidebarItemId";
import { useSidebarContext } from "./context/useSidebarContext";
import { SidebarItemIdGenerator } from "./ids/SidebarItemIdGenerator";
import { NonEditableSidebarItemRow } from "./row/non-editable-row/NonEditableSidebarItemRow";
import styles from "./Sidebar.module.scss";

export const Sidebar: React.FC = () => {
    const { setDraft } = useSidebarContext();

    const [selectedSidebarItemId, setSelectedSidebarItemId] = useSelectedSidebarItemId();
    useEffect(() => {
        if (selectedSidebarItemId?.type === "unknown") {
            setSelectedSidebarItemId(undefined);
        }
    }, [selectedSidebarItemId?.type, setSelectedSidebarItemId]);

    const createDraftPackage = useCreateDraftPackage({ parent: undefined });

    const onClickAddPackage = useCallback(() => {
        setDraft(createDraftPackage());
    }, [createDraftPackage, setDraft]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.topSection}>
                <Button
                    className={styles.addPackageButton}
                    intent={Intent.PRIMARY}
                    icon={<PackageIcon />}
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
