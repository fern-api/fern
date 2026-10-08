import { go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { Streamer } from "../Streamer.js";

const ROOT_IMPORT_PATH = "github.com/acme/plants";

function createContext({ perEndpointErrorCodes }: { perEndpointErrorCodes: boolean }): SdkGeneratorContext {
    const context = Object.create(SdkGeneratorContext.prototype) as SdkGeneratorContext;
    Object.assign(context, {
        isPerEndpointErrorCodes: () => perEndpointErrorCodes,
        getRootImportPath: () => ROOT_IMPORT_PATH,
        getInternalImportPath: () => `${ROOT_IMPORT_PATH}/internal`,
        getCoreImportPath: () => `${ROOT_IMPORT_PATH}/core`
    });
    return context;
}

function renderStream({
    perEndpointErrorCodes,
    errorCodes
}: {
    perEndpointErrorCodes: boolean;
    errorCodes?: go.AstNode;
}): string {
    const streamer = new Streamer(createContext({ perEndpointErrorCodes }));
    const node = streamer.stream({
        endpoint: { method: "POST", retries: undefined } as unknown as FernIr.HttpEndpoint,
        streamerVariable: go.codeblock("streamer"),
        optionsReference: go.codeblock("options"),
        url: go.codeblock("endpointURL"),
        streamingResponse: FernIr.StreamingResponse.sse({
            payload: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
            terminator: undefined,
            resumable: false,
            docs: undefined,
            v2Examples: undefined
        }),
        errorCodes,
        namespaceImportPath: ROOT_IMPORT_PATH
    });
    return node.toString({
        packageName: "plants",
        rootImportPath: ROOT_IMPORT_PATH,
        importPath: ROOT_IMPORT_PATH,
        customConfig: {}
    });
}

describe("Streamer.stream ErrorDecoder", () => {
    it("omits the ErrorDecoder in per-endpoint mode when the endpoint has no errors", () => {
        const output = renderStream({ perEndpointErrorCodes: true });
        expect(output).not.toContain("ErrorDecoder");
        expect(output).not.toContain("ErrorCodes");
    });

    it("uses the local errorCodes in per-endpoint mode when the endpoint has errors", () => {
        const output = renderStream({ perEndpointErrorCodes: true, errorCodes: go.codeblock("errorCodes") });
        expect(output).toContain("ErrorDecoder: internal.NewErrorDecoder(errorCodes)");
    });

    it("uses the namespace ErrorCodes in global mode", () => {
        const output = renderStream({ perEndpointErrorCodes: false });
        expect(output).toContain("ErrorDecoder: internal.NewErrorDecoder(ErrorCodes)");
    });
});
