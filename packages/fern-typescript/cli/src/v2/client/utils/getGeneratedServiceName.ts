import { ServiceName } from "@fern-fern/ir-model/services";

export function getGeneratedServiceName(serviceName: ServiceName): string {
    return serviceName.name;
}
