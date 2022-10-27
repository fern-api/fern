import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { Packages } from "./Packages";
import styles from "./Sidebar.module.scss";

export const Sidebar: React.FC = () => {
    return (
        <div className={styles.sidebar} onContextMenu={preventDefault}>
            <Button
                className={styles.addResourceButton}
                intent={Intent.PRIMARY}
                icon={IconNames.BOX}
                text="Add package"
            />
            <Packages />
        </div>
    );
};

function preventDefault(e: React.MouseEvent) {
    e.preventDefault();
}
