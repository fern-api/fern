import { FernRegistry } from "@fern-fern/registry";
import { SidebarItem } from "./SidebarItem";
import styles from "./ServiceSidebarSection.module.scss";

export declare namespace ServiceSidebarSection {
    export interface Props {
        service: FernRegistry.ServiceDefinition;
        serviceIndex: number;
    }
}

export const ServiceSidebarSection: React.FC<ServiceSidebarSection.Props> = ({ service, serviceIndex }) => {
    return (
        <div className={styles.container}>
            <SidebarItem key={service.name} label="Service" serviceIndex={serviceIndex} endpointIndex={undefined} />
            {service.endpoints.map((_endpoint, endpointIndex) => (
                <SidebarItem
                    key={endpointIndex}
                    label="Endpoint"
                    serviceIndex={serviceIndex}
                    endpointIndex={endpointIndex}
                />
            ))}
        </div>
    );
};
