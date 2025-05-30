import { FernIr } from "@fern-api/ir-sdk";
import { AbstractConverter, AbstractConverterContext } from "@fern-api/v2-importer-commons";

import { FernGlobalHeadersExtension } from "../extensions/x-fern-global-headers";

export function convertGlobalHeadersExtension({
    globalHeaders,
    context
}: {
    globalHeaders: FernGlobalHeadersExtension.GlobalHeaderExtension[];
    context: AbstractConverterContext<object>;
}): FernIr.HttpHeader[] {
    return globalHeaders.map((header) => ({
        name: context.casingsGenerator.generateNameAndWireValue({
            name: header.name ?? "",
            wireValue: header.header
        }),
        valueType: header.optional ? AbstractConverter.OPTIONAL_STRING : AbstractConverter.STRING,
        env: header.env,
        v2Examples: undefined,
        availability: undefined,
        docs: undefined
    }));
}
