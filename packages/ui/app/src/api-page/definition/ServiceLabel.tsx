import { H1 } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import { useTrackSidebarItemId } from "./useTrackSidebarItemId";

export declare namespace ServiceLabel {
    export interface Props {
        service: FernRegistry.ServiceDefinition;
        serviceIndex: number;
    }
}

export const ServiceLabel: React.FC<ServiceLabel.Props> = ({ service, serviceIndex }) => {
    const ref = useTrackSidebarItemId({ serviceIndex, endpointIndex: undefined });

    return <H1 elementRef={ref}>{service.name}</H1>;
};
