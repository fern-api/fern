import { csharp } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): csharp.Type | undefined {
    if (endpoint.response?.body == null) {
        if (endpoint.method === FernIr.HttpMethod.Head) {
            return csharp.Type.reference(context.getHttpResponseHeadersReference());
        }
        return undefined;
    }
    return endpoint.response.body._visit({
        streamParameter: () => undefined,
        fileDownload: () =>
            csharp.Type.reference(
                csharp.classReference({
                    name: "Stream",
                    namespace: "System.IO"
                })
            ),
        json: (reference) => {
            return context.csharpTypeMapper.convert({ reference: reference.responseBodyType });
        },
        streaming: (reference) => {
            return reference._visit({
                json: (jsonChunk) => {
                    const payloadType = context.csharpTypeMapper.convert({ reference: jsonChunk.payload });
                    return csharp.Type.reference(
                        csharp.classReference({
                            name: "IAsyncEnumerable",
                            namespace: "System.Collections.Generic",
                            generics: [payloadType]
                        })
                    );
                },
                text: () => {
                    return csharp.Type.reference(
                        csharp.classReference({
                            name: "IAsyncEnumerable",
                            namespace: "System.Collections.Generic",
                            generics: [csharp.Type.string()]
                        })
                    );
                },
                sse: (sseChunk) => {
                    const payloadType = context.csharpTypeMapper.convert({ reference: sseChunk.payload });
                    return csharp.Type.reference(
                        csharp.classReference({
                            name: "IAsyncEnumerable",
                            namespace: "System.Collections.Generic",
                            generics: [payloadType]
                        })
                    );
                },
                _other: () => undefined
            });
        },
        text: () => csharp.Type.string(),
        bytes: () => undefined,
        _other: () => undefined
    });
}
