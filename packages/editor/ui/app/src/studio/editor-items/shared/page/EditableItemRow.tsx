import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import styles from "./EditableItemRow.module.scss";

export declare namespace EditableItemRow {
    export type Props = React.PropsWithChildren<{
        leftContent: JSX.Element;
        onDelete: () => void;
    }>;
}

export const EditableItemRow: React.FC<EditableItemRow.Props> = ({ leftContent, onDelete, children }) => {
    const isCollapsible = children != null;
    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(true);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    {isCollapsible && (
                        <Button
                            icon={isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN}
                            onClick={toggleIsCollapsed}
                            minimal
                        />
                    )}
                    {leftContent}
                </div>
                <div className={styles.headerActions}>
                    <Button icon={IconNames.TRASH} intent={Intent.DANGER} minimal onClick={onDelete} />
                </div>
            </div>

            {isCollapsed || <div className={styles.details}>{children}</div>}
        </div>
    );
};
