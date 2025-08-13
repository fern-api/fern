import { ruby } from "@fern-api/ruby-ast";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
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
