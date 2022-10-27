import { Divider } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { Package } from "./Package";
import styles from "./Packages.module.scss";
import { SidebarItem } from "./SidebarItem";

export const Packages: React.FC = () => {
    return (
        <div className={styles.container}>
            <SidebarItem icon={IconNames.COG} label="API Configuration" isCollapsed={undefined} />
            <SidebarItem icon={IconNames.CODE_BLOCK} label="SDKs" isCollapsed={undefined} />
            <Divider />
            <div className={styles.packages}>
                <Package />
                <Package />
                <Package />
            </div>
        </div>
    );
};
