import { ServiceName } from "@fern-fern/ir-model/services";
import { getGeneratedServiceName } from "./getGeneratedServiceName";

export function getFileNameForService(serviceName: ServiceName): string {
    return `${getGeneratedServiceName(serviceName)}.ts`;
}
