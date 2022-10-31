import { Intent, Tag } from "@blueprintjs/core";
import { LightweightError } from "../../../mock-backend/MockBackend";
import { SidebarItemRow } from "../items/SidebarItemRow";
import styles from "./ErrorSidebarItem.module.scss";

export declare namespace ErrorSidebarItem {
    export interface Props {
        error: LightweightError;
    }
}

export const ErrorSidebarItem: React.FC<ErrorSidebarItem.Props> = ({ error }) => {
    return (
        <SidebarItemRow
            itemId={error.errorId}
            label={error.name}
            icon={
                <Tag className={styles.tag} intent={Intent.DANGER} minimal>
                    {error.statusCode}
                </Tag>
            }
        />
    );
};
