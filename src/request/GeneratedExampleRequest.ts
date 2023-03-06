import {
    ExampleEndpointCall,
    ExampleHeader,
    ExamplePathParameter,
    HttpHeader,
    PathParameter,
} from "@fern-fern/ir-model/http";
import { PostmanHeader, PostmanUrlVariable } from "@fern-fern/postman-sdk/api";
import { AbstractGeneratedRequest } from "./AbstractGeneratedRequest";

export declare namespace GeneratedExampleRequest {
    export interface Init extends AbstractGeneratedRequest.Init {
        example: ExampleEndpointCall;
    }
}

export class GeneratedExampleRequest extends AbstractGeneratedRequest {
    private example: ExampleEndpointCall;

    constructor({ example, ...superInit }: GeneratedExampleRequest.Init) {
        super(superInit);
        this.example = example;
    }

    protected getQueryParams(): PostmanUrlVariable[] {
        return this.example.queryParameters.map((exampleQueryParameter) => {
            const queryParameterDeclaration = this.httpEndpoint.queryParameters.find(
                (param) => param.name.wireValue === exampleQueryParameter.wireKey
            );
            if (queryParameterDeclaration == null) {
                throw new Error(`Cannot find query parameter ${exampleQueryParameter.wireKey}`);
            }
            return {
                key: exampleQueryParameter.wireKey,
                description: queryParameterDeclaration.docs ?? undefined,
                value:
                    typeof exampleQueryParameter.value.jsonExample !== "string"
                        ? JSON.stringify(exampleQueryParameter.value.jsonExample)
                        : exampleQueryParameter.value.jsonExample,
            };
        });
    }

    protected getPathParams(): PostmanUrlVariable[] {
        return [
            ...this.getPathParamsFromExamples({
                pathParameters: this.httpService.pathParameters,
                examples: this.example.servicePathParameters,
            }),
            ...this.getPathParamsFromExamples({
                pathParameters: this.httpEndpoint.pathParameters,
                examples: this.example.endpointPathParameters,
            }),
        ];
    }

    private getPathParamsFromExamples({
        pathParameters,
        examples,
    }: {
        pathParameters: PathParameter[];
        examples: ExamplePathParameter[];
    }) {
        return examples.map((examplePathParameter) => {
            const pathParameterDeclaration = pathParameters.find(
                (param) => param.name.originalName === examplePathParameter.key
            );
            if (pathParameterDeclaration == null) {
                throw new Error(`Cannot find path parameter ${examplePathParameter.key}`);
            }
            return {
                key: examplePathParameter.key,
                description: pathParameterDeclaration.docs ?? undefined,
                value:
                    typeof examplePathParameter.value.jsonExample !== "string"
                        ? JSON.stringify(examplePathParameter.value.jsonExample)
                        : examplePathParameter.value.jsonExample,
            };
        });
    }

    protected getHeaders(): PostmanHeader[] {
        return [
            ...this.getHeadersFromExamples({
                headers: this.httpService.headers,
                examples: this.example.serviceHeaders,
            }),
            ...this.getHeadersFromExamples({
                headers: this.httpEndpoint.headers,
                examples: this.example.endpointHeaders,
            }),
            ...[
                {
                    type: "text",
                    key: "Content-Type",
                    value: "application/json",
                },
            ],
        ];
    }

    private getHeadersFromExamples({
        headers,
        examples,
    }: {
        headers: HttpHeader[];
        examples: ExampleHeader[];
    }): PostmanHeader[] {
        return examples.map((exampleHeader) => {
            const headerDeclaration = headers.find((header) => header.name.wireValue === exampleHeader.wireKey);
            if (headerDeclaration == null) {
                throw new Error(`Cannot find header ${exampleHeader.wireKey}`);
            }
            return this.convertHeader({
                header: headerDeclaration,
                value: exampleHeader.value.jsonExample,
            });
        });
    }

    protected getRequestBody(): unknown {
        return this.example.request?.jsonExample;
    }
}
