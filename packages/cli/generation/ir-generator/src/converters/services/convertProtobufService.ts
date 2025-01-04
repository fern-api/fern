import { ProtobufService } from "@fern-api/ir-sdk";
import { ResolvedSource } from "@fern-api/source-resolver";

import { CASINGS_GENERATOR } from "../../utils/getAllPropertiesForObject";
import { convertProtobufFile } from "../convertProtobufFile";

export function convertProtobufService({
    source,
    serviceNameOverride
}: {
    source: ResolvedSource.Protobuf;
    serviceNameOverride: string | undefined;
}): ProtobufService | undefined {
    const serviceName = serviceNameOverride ?? source.serviceName;
    if (serviceName == null) {
        return undefined;
    }
    return {
        file: convertProtobufFile({ source }),
        // Use the global casings generator so that the name is not
        // affected by the user's casing settings (e.g. smart-casing).
        name: CASINGS_GENERATOR.generateName(serviceName)
    };
}
