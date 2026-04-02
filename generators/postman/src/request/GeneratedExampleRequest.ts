import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { PostmanHeader, PostmanUrlVariable } from "@fern-fern/postman-sdk/api";
import { AbstractGeneratedRequest } from "./AbstractGeneratedRequest.js";

export declare namespace GeneratedExampleRequest {
    export interface Init extends AbstractGeneratedRequest.Init {
        example: FernIr.ExampleEndpointCall;
    }
}

export class GeneratedExampleRequest extends AbstractGeneratedRequest {
    private example: FernIr.ExampleEndpointCall;

    constructor({ example, ...superInit }: GeneratedExampleRequest.Init) {
        super(superInit);
        this.example = example;
    }

    protected getQueryParams(): PostmanUrlVariable[] {
        return this.example.queryParameters.map((exampleQueryParameter) => {
            const queryParameterDeclaration = this.httpEndpoint.queryParameters.find(
                (param) => getWireValue(param.name) === getWireValue(exampleQueryParameter.name)
            );
            if (queryParameterDeclaration == null) {
                throw new Error(`Cannot find query parameter ${getWireValue(exampleQueryParameter.name)}`);
            }

            // Optional parameters should be disabled by default in Postman UI
            const isOptional =
                queryParameterDeclaration.valueType.type === "container" &&
                queryParameterDeclaration.valueType.container.type === "optional";

            return {
                key: getWireValue(exampleQueryParameter.name),
                description: queryParameterDeclaration.docs ?? undefined,
                value:
                    typeof exampleQueryParameter.value.jsonExample !== "string"
                        ? JSON.stringify(exampleQueryParameter.value.jsonExample)
                        : exampleQueryParameter.value.jsonExample,
                disabled: isOptional ? true : undefined
            };
        });
    }

    protected getPathParams(): PostmanUrlVariable[] {
        return [
            ...this.getPathParamsFromExamples({
                pathParameters: this.ir.pathParameters,
                examples: this.example.rootPathParameters
            }),
            ...this.getPathParamsFromExamples({
                pathParameters: this.httpService.pathParameters,
                examples: this.example.servicePathParameters
            }),
            ...this.getPathParamsFromExamples({
                pathParameters: this.httpEndpoint.pathParameters,
                examples: this.example.endpointPathParameters
            })
        ];
    }

    private getPathParamsFromExamples({
        pathParameters,
        examples
    }: {
        pathParameters: FernIr.PathParameter[];
        examples: FernIr.ExamplePathParameter[];
    }) {
        return examples.map((examplePathParameter) => {
            const pathParameterDeclaration = pathParameters.find(
                (param) => getOriginalName(param.name) === getOriginalName(examplePathParameter.name)
            );
            if (pathParameterDeclaration == null) {
                throw new Error(`Cannot find path parameter ${getOriginalName(examplePathParameter.name)}`);
            }
            return {
                key: getOriginalName(examplePathParameter.name),
                description: pathParameterDeclaration.docs ?? undefined,
                value:
                    typeof examplePathParameter.value.jsonExample !== "string"
                        ? JSON.stringify(examplePathParameter.value.jsonExample)
                        : examplePathParameter.value.jsonExample
            };
        });
    }

    protected getHeaders(): PostmanHeader[] {
        return [
            ...this.getHeadersFromExamples({
                headers: this.httpService.headers,
                examples: this.example.serviceHeaders
            }),
            ...this.getHeadersFromExamples({
                headers: this.httpEndpoint.headers,
                examples: this.example.endpointHeaders
            }),
            ...[
                {
                    type: "text",
                    key: "Content-Type",
                    value: "application/json"
                }
            ]
        ];
    }

    private getHeadersFromExamples({
        headers,
        examples
    }: {
        headers: FernIr.HttpHeader[];
        examples: FernIr.ExampleHeader[];
    }): PostmanHeader[] {
        return examples.map((exampleHeader) => {
            const headerDeclaration = headers.find((header) => getWireValue(header.name) === getWireValue(exampleHeader.name));
            if (headerDeclaration == null) {
                throw new Error(`Cannot find header ${getWireValue(exampleHeader.name)}`);
            }
            return this.convertHeader({
                header: headerDeclaration,
                value: exampleHeader.value.jsonExample
            });
        });
    }

    protected getRequestBody(): unknown {
        return this.example.request?.jsonExample;
    }
}
