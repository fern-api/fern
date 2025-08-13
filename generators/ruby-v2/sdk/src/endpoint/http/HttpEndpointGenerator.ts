import { ruby } from "@fern-api/ruby-ast";
import { HttpEndpoint, PathParameter, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { getEndpointRequest } from "../utils/getEndpointRequest";
import { getEndpointReturnType } from "../utils/getEndpointReturnType";
import { RawClient } from "./RawClient";

export declare namespace HttpEndpointGenerator {
    export interface GenerateArgs {
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }
}

export class HttpEndpointGenerator {
    private context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public generate({ endpoint, serviceId }: HttpEndpointGenerator.GenerateArgs): ruby.Method[] {
        return [this.generateUnpagedMethod({ endpoint, serviceId })];
    }

    private generateUnpagedMethod({
        endpoint,
        serviceId
    }: {
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }): ruby.Method {
        const rawClient = new RawClient(this.context);

        const returnType = getEndpointReturnType({ context: this.context, endpoint });

        const request = getEndpointRequest({
            context: this.context,
            endpoint,
            serviceId
        });

        const statements = [];

        const pathParameterReferences = this.getPathParameterReferences({ endpoint });

        const sendRequestCodeBlock = rawClient.sendRequest({
            baseUrl: ruby.codeblock(""),
            pathParameterReferences,
            endpoint,
            requestType: request?.getRequestType()
        });

        if (sendRequestCodeBlock != null) {
            statements.push(sendRequestCodeBlock);
        } else {
            statements.push(
                ruby.codeblock((writer) => {
                    writer.writeLine("raise NotImplementedError, 'This method is not yet implemented.'");
                })
            );
        }

        return ruby.method({
            name: endpoint.name.snakeCase.safeName,
            docstring: endpoint.docs,
            returnType,
            parameters: {
                keyword: [
                    ruby.parameters.keyword({
                        name: "request_options",
                        initializer: ruby.TypeLiteral.hash([])
                    })
                ],
                keywordSplat: ruby.parameters.keywordSplat({
                    name: "params"
                })
            },
            statements
        });
    }

    protected getPathParameterReferences({ endpoint }: { endpoint: HttpEndpoint }): Record<string, string> {
        const pathParameterReferences: Record<string, string> = {};
        for (const pathParam of endpoint.allPathParameters) {
            const parameterName = this.getPathParameterName({
                pathParameter: pathParam
            });
            pathParameterReferences[pathParam.name.originalName] = `params[:${parameterName}]`;
        }
        return pathParameterReferences;
    }

    private getPathParameterName({ pathParameter }: { pathParameter: PathParameter }): string {
        return pathParameter.name.originalName;
    }
}
