import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbstractAstNode } from "../ast/index.js";
import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext.js";
import { Options } from "./Options.js";

export abstract class AbstractEndpointSnippetGenerator<Context extends AbstractDynamicSnippetsGeneratorContext> {
    public abstract generateSnippet({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): Promise<string>;

    public abstract generateSnippetSync({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): string;

    public abstract generateSnippetAst({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): Promise<AbstractAstNode>;

    /**
     * Generates just the endpoint invocation (e.g. `client.plants.update(...)`), without
     * imports or client instantiation, for callers that render the invocation within code
     * of their own (e.g. a documentation code template).
     *
     * Implemented per generator; generators that do not implement it fall back to the
     * complete snippet.
     */
    public generateInvocationSnippetSync?({
        endpoint,
        request,
        options
    }: {
        endpoint: FernIr.dynamic.Endpoint;
        request: FernIr.dynamic.EndpointSnippetRequest;
        options?: Options;
    }): string;
}
