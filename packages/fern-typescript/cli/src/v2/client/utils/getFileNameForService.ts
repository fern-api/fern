import { ServiceName } from "@fern-fern/ir-model/services";

export function getFileNameForService(_serviceName: ServiceName): string {
    return "_Client.ts";
}
