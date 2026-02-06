import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
}): ruby.Type | undefined {
    return endpoint.response?.body?._visit({
        streaming: () => undefined,
        streamParameter: () => undefined,
        fileDownload: () => undefined,
        json: (reference) => context.typeMapper.convert({ reference: reference.responseBodyType }),
        text: () => ruby.Type.string(),
        bytes: () => undefined,
        _other: () => undefined
    });
}
