import { Colors, Icon, Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import styles from "./SidebarIcon.module.scss";

export const SidebarIcon = {
    PACKAGE: IconNames.BOX,
    ENDPOINT: <Tag minimal intent={Intent.PRIMARY} icon={IconNames.EXCHANGE} />,
    TYPE: <Icon icon={IconNames.CUBE} color={Colors.TURQUOISE3} />,
    ERROR: (error: FernApiEditor.Error): JSX.Element => (
        <Tag className={styles.tag} intent={Intent.DANGER} minimal>
            {error.statusCode}
        </Tag>
    ),
};
