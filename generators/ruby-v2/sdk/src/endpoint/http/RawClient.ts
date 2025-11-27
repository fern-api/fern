import { ruby } from "@fern-api/ruby-ast";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export const RAW_CLIENT_REQUEST_VARIABLE_NAME = "_request";
export declare namespace RawClient {
    export interface CreateHttpRequestWrapperArgs {
        baseUrl: ruby.CodeBlock;
        /** the endpoint for the endpoint */
        endpoint: HttpEndpoint;
        /** reference to a variable that is the body */
        bodyReference?: ruby.CodeBlock;
        /** the path parameter id to reference */
        pathParameterReferences: Record<string, string>;
        /** the headers to pass to the endpoint */
        headerBagReference?: string;
        /** the query parameters to pass to the endpoint */
        queryBagReference?: string;
        /** the request type, defaults to Json if none */
        requestType: RequestBodyType | undefined;
    }

    export type RequestBodyType = "json" | "bytes" | "multipartform";
}

export class RawClient {
    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    private writeBaseUrlDeclaration(writer: ruby.Writer): void {
        // Write base URL declaration, including default environment if specified
        writer.write("base_url: request_options[:base_url]");
        const defaultEnvironmentReference = this.context.getDefaultEnvironmentClassReference();
        if (defaultEnvironmentReference != null) {
            writer.write(" || ");
            writer.writeNode(defaultEnvironmentReference);
        }
    }

    public sendRequest({
        baseUrl,
        endpoint,
        bodyReference,
        pathParameterReferences,
        headerBagReference,
        queryBagReference,
        requestType
    }: RawClient.CreateHttpRequestWrapperArgs): ruby.CodeBlock | undefined {
        switch (requestType) {
            case "json":
                return ruby.codeblock((writer) => {
                    writer.writeLine(
                        `${RAW_CLIENT_REQUEST_VARIABLE_NAME} = ${this.context.getReferenceToInternalJSONRequest()}.new(`
                    );
                    writer.indent();
                    this.writeBaseUrlDeclaration(writer);
                    writer.writeLine(",");
                    writer.writeLine(`method: "${endpoint.method.toUpperCase()}",`);
                    writer.write(`path: `);
                    this.writePathString({ writer, endpoint, pathParameterReferences });
                    writer.writeLine(",");
                    if (headerBagReference != null) {
                        writer.writeLine(`headers: ${headerBagReference},`);
                    }
                    if (queryBagReference != null) {
                        writer.writeLine(`query: ${queryBagReference},`);
                    }
                    if (bodyReference != null) {
                        writer.writeLine(`body: ${bodyReference},`);
                    }
                    writer.dedent();
                    writer.write(`)`);
                });
            case "bytes":
                return undefined;
            case "multipartform":
                return ruby.codeblock((writer) => {
                    writer.writeLine(
                        `${RAW_CLIENT_REQUEST_VARIABLE_NAME} = ${this.context.getReferenceToInternalMultipartRequest()}.new(`
                    );
                    writer.indent();
                    this.writeBaseUrlDeclaration(writer);
                    writer.writeLine(",");
                    writer.writeLine(`method: "${endpoint.method.toUpperCase()}",`);
                    writer.write(`path: `);
                    this.writePathString({ writer, endpoint, pathParameterReferences });
                    writer.writeLine(",");
                    if (headerBagReference != null) {
                        writer.writeLine(`headers: ${headerBagReference},`);
                    }
                    if (queryBagReference != null) {
                        writer.writeLine(`query: ${queryBagReference},`);
                    }
                    if (bodyReference != null) {
                        writer.writeLine(`body: ${bodyReference},`);
                    }
                    writer.dedent();
                    writer.write(`)`);
                });
        }
        return ruby.codeblock((writer) => {
            writer.writeLine(
                `${RAW_CLIENT_REQUEST_VARIABLE_NAME} = ${this.context.getReferenceToInternalJSONRequest()}.new(`
            );
            writer.indent();
            this.writeBaseUrlDeclaration(writer);
            writer.writeLine(",");
            writer.writeLine(`method: "${endpoint.method.toUpperCase()}",`);
            writer.write(`path: `);
            this.writePathString({ writer, endpoint, pathParameterReferences });
            writer.newLine();
            writer.dedent();
            writer.write(`)`);
        });
    }

    private writePathString({
        writer,
        endpoint,
        pathParameterReferences
    }: {
        writer: ruby.Writer;
        endpoint: HttpEndpoint;
        pathParameterReferences: Record<string, string>;
    }): void {
        const hasPathParameters = endpoint.fullPath.parts.some((part) => part.pathParameter != null);
        if (!hasPathParameters) {
            writer.write(`"${endpoint.fullPath.head}"`);
            return;
        }

        // Build the Ruby string interpolation for the path
        let rubyPath = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts) {
            if (part.pathParameter != null) {
                const reference = pathParameterReferences[part.pathParameter];
                if (reference == null) {
                    rubyPath += `#{${part.tail}}`;
                } else {
                    // Insert Ruby interpolation for the path parameter
                    rubyPath += `#{${reference}}${part.tail}`;
                }
            } else {
                rubyPath += part.tail;
            }
        }
        writer.write(`"${rubyPath}"`);
    }
}
