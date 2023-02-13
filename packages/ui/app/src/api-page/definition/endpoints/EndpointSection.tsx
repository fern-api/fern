import { H4 } from "@blueprintjs/core";
import styles from "./EndpointSection.module.scss";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({ title, description, children }) => {
    return (
        <div className={styles.container}>
            <H4>{title}</H4>
            {description != null && <div className={styles.description}>{description}</div>}
            <div className={styles.body}>{children}</div>
        </div>
    );
};
