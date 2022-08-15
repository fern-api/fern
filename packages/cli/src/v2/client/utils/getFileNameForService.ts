import { DeclaredServiceName } from "@fern-fern/ir-model/services";

export function getFileNameForService(_serviceName: DeclaredServiceName): string {
    return "_Client.ts";
}
