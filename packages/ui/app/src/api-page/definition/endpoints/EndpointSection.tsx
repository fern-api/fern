import { H4 } from "@blueprintjs/core";
import { Docs } from "../docs/Docs";
import styles from "./EndpointSection.module.scss";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        docs?: string;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({ title, docs, children }) => {
    return (
        <div className={styles.container}>
            <H4>{title}</H4>
            {docs != null && (
                <div className="mb-2">
                    <Docs docs={docs} />
                </div>
            )}
            <div className={styles.body}>{children}</div>
        </div>
    );
};
