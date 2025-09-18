import { RawSchemas } from "@fern-api/fern-definition-schema";
import { RetriesConfiguration } from "@fern-api/ir-sdk";

export function convertRetries({
    endpointSchema
}: {
    endpointSchema: RawSchemas.HttpEndpointSchema;
}): RetriesConfiguration | undefined {
    if (!endpointSchema.retries) {
        return undefined;
    }

    if (endpointSchema.retries.type === "disabled") {
        return RetriesConfiguration.disabled();
    }

    return undefined;
}
