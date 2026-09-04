import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbstractAstNode } from "../ast/index.js";
import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext.js";
import { InvocationSnippetResponse } from "./InvocationSnippetResponse.js";
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
     * Generates the structured pieces of an endpoint invocation for callers that render the
     * invocation within code of their own (e.g. a documentation code template): the bare call
     * (e.g. `client.plants.update(...)`), the imports the call requires, and the generated
     * client class/type name.
     *
     * Implemented per generator; generators that do not implement it are detected via the
     * absence of this method (the capability check callers rely on) and fall back to the
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
    }): InvocationSnippetResponse | undefined;
}
