import { Button, Divider, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { isLoaded } from "@fern-api/loadable";
import React from "react";
import { useLightweightAPI } from "../queries/useLightweightApi";
import { SidebarItemRow } from "./items/SidebarItemRow";
import { Packages } from "./packages/Packages";
import styles from "./Sidebar.module.scss";

export const Sidebar: React.FC = () => {
    const lightweightApi = useLightweightAPI();

    return (
        <div className={styles.sidebar}>
            <div className={styles.topSection}>
                <Button
                    className={styles.addResourceButton}
                    intent={Intent.PRIMARY}
                    icon={IconNames.BOX}
                    text="Add package"
                    disabled={!isLoaded(lightweightApi)}
                />
                <SidebarItemRow itemId="xyz" icon={IconNames.COG} label="API Configuration" />
                <SidebarItemRow itemId="xyz" icon={IconNames.CODE_BLOCK} label="SDKs" />
            </div>
            <div className={styles.sidebarItems}>
                <Divider className={styles.divider} />
                <Packages />
            </div>
        </div>
    );
};
