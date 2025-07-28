import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import { HttpEndpoint, HttpService, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

interface EndpointParameter {
    name: string;
    type: string;
    isRef: boolean;
    optional: boolean;
}

export class SubClientGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly subpackage: Subpackage;
    private readonly service?: HttpService;

    constructor(context: SdkGeneratorContext, subpackage: Subpackage) {
        this.context = context;
        this.subpackage = subpackage;
        this.service = subpackage.service ? this.context.getHttpServiceOrThrow(subpackage.service) : undefined;
    }

    private get subClientName(): string {
        return this.subpackage.name.pascalCase.safeName + "Client";
    }

    public generate(): RustFile {
        const filename = `${this.subpackage.name.snakeCase.safeName}.rs`;
        const endpoints = this.service?.endpoints || [];

        // Generate simple client structure (Swift pattern)
        const rustClient = rust.client({
            name: this.subClientName,
            fields: this.generateFields(),
            constructors: [this.generateConstructor()],
            methods: this.convertEndpointsToHttpMethods(endpoints)
        });

        const fileContents = this.addImports() + rustClient.toString();
        return new RustFile({
            filename,
            directory: RelativeFilePath.of("src/client"),
            fileContents
        });
    }

    private addImports(): string {
        return `use crate::{ClientConfig, ClientError, HttpClient, RequestOptions};
use reqwest::Method;

`;
    }

    private generateFields(): rust.Client.Field[] {
        // Use HttpClient which contains the configuration
        return [{ name: "http_client", type: "HttpClient", visibility: "private" }];
    }

    private generateConstructor(): rust.Client.SimpleMethod {
        return {
            name: "new",
            parameters: ["config: ClientConfig"],
            returnType: "Result<Self, ClientError>",
            isAsync: false,
            body: `let http_client = HttpClient::new(config)?;
        Ok(Self { http_client })`
        };
    }

    private convertEndpointsToHttpMethods(endpoints: HttpEndpoint[]): rust.Client.SimpleMethod[] {
        return endpoints.map((endpoint) => this.generateHttpMethod(endpoint));
    }

    private generateHttpMethod(endpoint: HttpEndpoint): rust.Client.SimpleMethod {
        const params = this.extractParametersFromEndpoint(endpoint);

        // Generate method signature with RequestOptions parameter
        const parameters = [
            ...params.map((param) => {
                let paramType = param.type;

                if (param.isRef) {
                    paramType = `&${paramType}`;
                }

                if (param.optional) {
                    paramType = `Option<${paramType}>`;
                }

                return `${param.name}: ${paramType}`;
            }),
            "options: Option<RequestOptions>"
        ];

        const httpMethod = this.getHttpMethod(endpoint);
        const path = this.getEndpointPath(endpoint);
        const requestBody = this.getRequestBody(endpoint, params);

        return {
            name: endpoint.name.snakeCase.safeName,
            parameters,
            returnType: `Result<${this.getReturnType(endpoint)}, ClientError>`,
            isAsync: true,
            body: `self.http_client.execute_request(
            Method::${httpMethod},
            "${path}",
            ${requestBody},
            options,
        ).await`
        };
    }

    private extractParametersFromEndpoint(endpoint: HttpEndpoint): EndpointParameter[] {
        const params: EndpointParameter[] = [];

        // Add path parameters
        endpoint.fullPath.parts.forEach((part) => {
            if (part.pathParameter) {
                const pathParam = endpoint.allPathParameters.find((p) => p.name.originalName === part.pathParameter);
                if (pathParam) {
                    params.push({
                        name: pathParam.name.snakeCase.safeName,
                        type: "String", // Simple string type for all path params
                        isRef: true, // Take by reference
                        optional: false
                    });
                }
            }
        });

        // Add query parameters
        endpoint.queryParameters.forEach((queryParam) => {
            params.push({
                name: queryParam.name.name.snakeCase.safeName,
                type: "String", // Simple string type for all query params
                optional: true, // Most query params are optional
                isRef: true
            });
        });

        // Add request body if present
        if (endpoint.requestBody) {
            params.push({
                name: "request",
                type: "serde_json::Value", // Simple generic type for all request bodies
                isRef: true,
                optional: false
            });
        }

        return params;
    }

    private getReturnType(endpoint: HttpEndpoint): string {
        // Simple: just use serde_json::Value for all responses
        return "serde_json::Value";
    }

    private getHttpMethod(endpoint: HttpEndpoint): string {
        return endpoint.method.toUpperCase();
    }

    private getEndpointPath(endpoint: HttpEndpoint): string {
        // Convert path parameters to string interpolation format
        let path = endpoint.fullPath.head;
        endpoint.fullPath.parts.forEach((part) => {
            if (part.pathParameter) {
                const pathParam = endpoint.allPathParameters.find((p) => p.name.originalName === part.pathParameter);
                if (pathParam) {
                    path += `/{${pathParam.name.snakeCase.safeName}}`;
                }
            } else {
                path += part.tail;
            }
        });
        return path;
    }

    private getRequestBody(endpoint: HttpEndpoint, params: EndpointParameter[]): string {
        // Check if there's a request body parameter
        const requestBodyParam = params.find((param) => param.name === "request");
        if (requestBodyParam && endpoint.requestBody) {
            return "Some(serde_json::to_value(request).unwrap_or_default())";
        }
        return "None";
    }
}
