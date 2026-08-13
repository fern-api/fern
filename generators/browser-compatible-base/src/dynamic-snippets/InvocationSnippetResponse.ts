import { FernIr } from "@fern-api/dynamic-ir-sdk";

/**
 * The structured result of an invocation-only snippet.
 *
 * Unlike {@link FernIr.dynamic.EndpointSnippetResponse}, which returns a single fully-formed
 * snippet string, this exposes the individual pieces a docs template needs to render (and
 * keep in sync) an invocation on its own: the bare call, the imports the call requires, and
 * the generated client class/type name.
 */
export interface InvocationSnippetResponse {
    /**
     * The bare invocation/call (e.g. `client.plants.update(...)`) with no imports, no client
     * instantiation, and no trailing statement terminator. Honors `options.clientVariableName`.
     */
    snippet: string;
    /**
     * The import block the call requires (e.g. an SDK namespace import for a branded string
     * alias). Empty string when the call references no imports.
     */
    imports: string;
    /**
     * The generated client class/type name (e.g. `AcmeClient`), so docs can render
     * `new {{clientName}}(...)` and track renames of the SDK client.
     */
    clientName: string;
    errors: FernIr.dynamic.Error_[] | undefined;
}
