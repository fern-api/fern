import styles from "./EndpointExample.module.scss";
import { JsonExample } from "./JsonExample";

export declare namespace EndpointExample {
    export interface Props {
        request: string;
        response: string;
    }
}

export const EndpointExample: React.FC<EndpointExample.Props> = () => {
    return (
        <div className={styles.example}>
            <JsonExample title="Request" />
            <div className={styles.divider} />
            <JsonExample title="Response" />
        </div>
    );
};
