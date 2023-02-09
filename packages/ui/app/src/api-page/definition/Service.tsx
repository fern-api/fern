import { FernRegistry } from "@fern-fern/registry";
import { Endpoint } from "./Endpoint";
import styles from "./Service.module.scss";
import { ServiceLabel } from "./ServiceLabel";

export declare namespace Service {
    export interface Props {
        service: FernRegistry.ServiceDefinition;
        serviceIndex: number;
    }
}

export const Service: React.FC<Service.Props> = ({ service, serviceIndex }) => {
    return (
        <div className={styles.container}>
            <ServiceLabel service={service} serviceIndex={serviceIndex} />
            {service.endpoints.map((endpoint, endpointIndex) => (
                <div key={endpointIndex} className={styles.endpointContainer}>
                    <div className={styles.divider} />
                    <div className={styles.endpoint}>
                        <Endpoint endpoint={endpoint} serviceIndex={serviceIndex} endpointIndex={endpointIndex} />
                    </div>
                </div>
            ))}
        </div>
    );
};
