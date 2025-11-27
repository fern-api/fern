import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbstractAstNode } from "../ast";
import { AbstractDynamicSnippetsGeneratorContext } from "./AbstractDynamicSnippetsGeneratorContext";
import { Options } from "./Options";

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
}
