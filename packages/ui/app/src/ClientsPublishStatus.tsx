import { Icon, Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import styles from "./ClientsPublishStatus.module.scss";

export const ClientsPublishStatus: React.FC = () => {
    return (
        <div className={styles.container}>
            <Icon icon={IconNames.TICK} intent={Intent.SUCCESS} />
            <div>SDKs published</div>
            <Tag className={styles.versionTag} minimal>
                0.0.45
            </Tag>
        </div>
    );
};
