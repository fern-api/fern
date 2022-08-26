import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";

export function getFileNameForService(_serviceName: DeclaredServiceName): string {
    return "_Client.ts";
}
