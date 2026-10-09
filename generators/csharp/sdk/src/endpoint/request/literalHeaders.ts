import { getWireValue } from "@fern-api/base-generator";
import { Writer } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

/**
 * Writes `.Add("<header>", "<value>")` entries for service- and endpoint-level headers whose
 * types are literals. Endpoints without a request wrapper have no request object to carry
 * these headers, so their values must be emitted inline.
 */
export function writeLiteralHeaders({
    writer,
    context,
    serviceId,
    endpoint
}: {
    writer: Writer;
    context: SdkGeneratorContext;
    serviceId: FernIr.ServiceId;
    endpoint: FernIr.HttpEndpoint;
}): void {
    const service = context.getHttpService(serviceId);
    const headers = [...(service?.headers ?? []), ...endpoint.headers];
    for (const header of headers) {
        const literalValue = context.getLiteralValue(header.valueType);
        if (literalValue != null) {
            writer.writeLine();
            writer.write(`.Add("${getWireValue(header.name)}", ${JSON.stringify(String(literalValue))})`);
        }
    }
}
