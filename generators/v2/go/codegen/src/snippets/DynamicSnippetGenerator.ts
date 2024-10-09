import { CodeBlock, MethodInvocation, StructInstantiation, Writer } from "../ast";
import { Context } from "./context/Context";
import { go } from "..";
import { AstNode } from "../go";
import {
    Endpoint,
    InlinedRequest,
    InlinedRequestBody,
    IntermediateRepresentation,
    NamedParameter,
    SnippetRequest,
    Values
} from "./generated/api";
import { GoTypeRenderer } from "./GoTypeRenderer";
import { FernGeneratorExec } from "@fern-api/generator-commons";
import { camelCase } from "lodash-es";
import path from "path";

const CLIENT_VAR_NAME = "client";

export class DynamicSnippetGenerator {
    private context: Context;
    private typeRenderer: GoTypeRenderer;

    constructor({ ir, config }: { ir: IntermediateRepresentation; config: FernGeneratorExec.config.GeneratorConfig }) {
        this.context = new Context({ ir, config });
        this.typeRenderer = new GoTypeRenderer({ context: this.context });
    }

    public generate({ snippet }: { snippet: SnippetRequest }): string {
        const code = this.buildCodeBlock({ snippet });
        return code.toString({
            packageName: camelCase(this.context.config.organization).toLowerCase(),
            rootImportPath: this.context.rootImportPath,
            importPath: "", // Always write the snippet as if we're a user importing the SDK.
            customConfig: this.context.customConfig,
            snippet: true
        });
    }

    private buildCodeBlock({ snippet }: { snippet: SnippetRequest }): CodeBlock {
        const endpoint = this.resolveEndpointOrThrow(snippet.endpointID);
        return new CodeBlock((writer) => {
            writer.writeNode(this.constructClient({ snippet }));
            writer.writeLine();
            writer.writeNode(this.callMethod({ endpoint, snippet }));
        });
    }

    private constructClient({ snippet }: { snippet: SnippetRequest }): CodeBlock {
        return go.codeblock((writer) => {
            writer.write(`${CLIENT_VAR_NAME} := `);
            writer.writeNode(this.getRootClientFuncInvocation(this.getConstructorArgs({ snippet })));
        });
    }

    private callMethod({ endpoint, snippet }: { endpoint: Endpoint; snippet: SnippetRequest }): MethodInvocation {
        return go.invokeMethod({
            on: go.codeblock(CLIENT_VAR_NAME),
            method: this.getMethod({ endpoint }),
            arguments_: this.getMethodArgs({ endpoint, snippet })
        });
    }

    private getConstructorArgs({ snippet }: { snippet: SnippetRequest }): AstNode[] {
        // TODO: Render auth and global header arguments.
        return [];
    }

    private getMethodArgs({ endpoint, snippet }: { endpoint: Endpoint; snippet: SnippetRequest }): AstNode[] {
        switch (endpoint.request.type) {
            case "inlined":
                return this.getMethodArgsForInlinedRequest({ request: endpoint.request, snippet });
            case "referenced":
                throw new Error("Implement me!");
        }
    }

    private getMethodArgsForInlinedRequest({
        request,
        snippet
    }: {
        request: InlinedRequest;
        snippet: SnippetRequest;
    }): AstNode[] {
        const args: AstNode[] = [];

        // Path parameters are specified separate from the in-lined request.
        const pathParameters = this.associateByWireValue({
            parameters: request.pathParameters,
            values: snippet.pathParameters ?? {}
        });
        for (const parameter of pathParameters) {
            args.push(
                go.codeblock((writer) => {
                    writer.writeNode(this.typeRenderer.render({ args: parameter }));
                })
            );
        }

        // All other parameters are included in the in-lined request.
        args.push(this.getInlinedRequestArg({ request, snippet }));

        return args;
    }

    private getInlinedRequestArg({ request, snippet }: { request: InlinedRequest; snippet: SnippetRequest }): AstNode {
        const fields: StructInstantiation.Field[] = [];

        const parameters = [
            ...this.associateByWireValue({
                parameters: request.queryParameters,
                values: snippet.queryParameters ?? {}
            }),
            ...this.associateByWireValue({
                parameters: request.headers,
                values: snippet.headers ?? {}
            })
        ];
        for (const parameter of parameters) {
            fields.push({
                name: parameter.name.pascalCase.unsafeName,
                value: go.codeblock((writer) => {
                    writer.writeNode(this.typeRenderer.render({ args: parameter }));
                })
            });
        }

        if (request.body != null) {
            fields.push(...this.getInlinedRequestBodyStructFields({ body: request.body, value: snippet.requestBody }));
        }

        return go.instantiateStruct({
            typeReference: go.typeReference({
                name: request.declaration.name.pascalCase.unsafeName,
                importPath: this.context.getImportPath(request.declaration.fernFilepath)
            }),
            fields,
            pointer: true
        });
    }

    private getInlinedRequestBodyStructFields({
        body,
        value
    }: {
        body: InlinedRequestBody;
        value: unknown;
    }): StructInstantiation.Field[] {
        switch (body.bodyType) {
            case "properties":
                return this.getInlinedRequestBodyPropertyStructFields({ parameters: body.value, value });
            case "referenced":
                throw new Error("TODO: Implement me!");
        }
    }

    private getInlinedRequestBodyPropertyStructFields({
        parameters,
        value
    }: {
        parameters: NamedParameter[];
        value: unknown;
    }): StructInstantiation.Field[] {
        const fields: StructInstantiation.Field[] = [];

        const bodyProperties = this.associateByWireValue({
            parameters,
            values: this.context.getRecordOrThrow(value)
        });
        for (const parameter of bodyProperties) {
            fields.push({
                name: parameter.name.pascalCase.unsafeName,
                value: this.typeRenderer.render({ args: parameter })
            });
        }

        return fields;
    }

    private associateByWireValue({
        parameters,
        values
    }: {
        parameters: NamedParameter[];
        values: Values;
    }): GoTypeRenderer.Args[] {
        const args: GoTypeRenderer.Args[] = [];
        for (const [key, value] of Object.entries(values)) {
            const parameter = parameters.find((param) => param.name.wireValue === key);
            if (parameter == null) {
                throw new Error(`"${key}" is not a recognized parameter for this endpoint`);
            }
            args.push({
                name: parameter.name.name,
                type: parameter.type,
                value
            });
        }
        return args;
    }

    private getMethod({ endpoint }: { endpoint: Endpoint }): string {
        if (endpoint.declaration.fernFilepath.packagePath.length > 0) {
            return `${endpoint.declaration.fernFilepath.packagePath
                .map((val) => val.pascalCase.unsafeName)
                .join(".")}.${endpoint.declaration.name.pascalCase.unsafeName}`;
        }
        return endpoint.declaration.name.pascalCase.unsafeName;
    }

    private getRootClientFuncInvocation(arguments_: AstNode[]): go.FuncInvocation {
        return go.invokeFunc({
            func: go.typeReference({
                name: "NewClient",
                importPath: path.join(this.context.rootImportPath, "client")
            }),
            arguments_
        });
    }

    private resolveEndpointOrThrow(endpointID: string): Endpoint {
        const endpoint = this.context.ir.endpoints[endpointID];
        if (endpoint == null) {
            throw new Error(`Failed to find endpoint identified by "${endpointID}"`);
        }
        return endpoint;
    }
}
