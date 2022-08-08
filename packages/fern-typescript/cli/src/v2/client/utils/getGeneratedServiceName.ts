import { ServiceName } from "@fern-fern/ir-model/services";
import { upperCamelCase } from "../../../utils/upperCamelCase";

export function getGeneratedServiceName(serviceName: ServiceName): string {
    return upperCamelCase(serviceName.name);
}
