import { Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { Endpoint } from "./Endpoint";
import styles from "./Package.module.scss";
import { SidebarItem } from "./SidebarItem";

export const Package: React.FC = () => {
    return (
        <div className={styles.container}>
            <SidebarItem
                label="Encounters"
                icon={IconNames.BOX}
                isCollapsed={false}
                onClickAdd={() => {
                    // TODO
                }}
                onClickMore={() => {
                    // TODO
                }}
            />
            <div className={styles.sections}>
                <Endpoint endpointName="create" />
                <Endpoint endpointName="get" />
                <Endpoint endpointName="update" />
                <Endpoint endpointName="delete" />
                <SidebarItem
                    isCollapsed={true}
                    label="Types"
                    indent={22}
                    onClickAdd={() => {
                        // TODO
                    }}
                />
                <SidebarItem
                    isCollapsed={false}
                    label="Errors"
                    indent={22}
                    onClickAdd={() => {
                        // TODO
                    }}
                />
                <SidebarItem
                    isCollapsed={undefined}
                    label="PostNotFoundErrorPostNotFoundErrorPostNotFoundError"
                    icon={
                        <Tag className={styles.errorStatusCode} intent={Intent.DANGER} minimal>
                            411
                        </Tag>
                    }
                    indent={50}
                    onClickMore={() => {
                        // TODO
                    }}
                />
                <SidebarItem
                    isCollapsed={undefined}
                    label="PostNotFoundErrorPostNotFoundErrorPostNotFoundError"
                    icon={
                        <Tag className={styles.errorStatusCode} intent={Intent.DANGER} minimal>
                            500
                        </Tag>
                    }
                    indent={50}
                    onClickMore={() => {
                        // TODO
                    }}
                />
                <SidebarItem
                    isCollapsed={undefined}
                    label="PostNotFoundErrorPostNotFoundErrorPostNotFoundError"
                    icon={
                        <Tag className={styles.errorStatusCode} intent={Intent.DANGER} minimal>
                            404
                        </Tag>
                    }
                    indent={50}
                    onClickMore={() => {
                        // TODO
                    }}
                />
            </div>
        </div>
    );
};
