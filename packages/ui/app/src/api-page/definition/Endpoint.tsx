import { H2 } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import styles from "./Endpoint.module.scss";
import { useTrackSidebarItemId } from "./useTrackSidebarItemId";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistry.Endpoint;
        serviceIndex: number;
        endpointIndex: number;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ serviceIndex, endpointIndex }) => {
    const ref = useTrackSidebarItemId({ serviceIndex, endpointIndex });

    return (
        <div ref={ref} className={styles.container}>
            <div className={styles.definition}>
                <H2>Create a customer</H2>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
                <div className={styles.property}>Property: foo</div>
            </div>
            <div className={styles.examples}>
                <div className={styles.example}>I am an example</div>
                <div className={styles.example}>I am an example</div>
            </div>
        </div>
    );
};
