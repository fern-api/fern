import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { DynamicSnippetsGenerator } from "@fern-api/rust-dynamic-snippets";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService, TypeReference } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";

export class ReferenceConfigAssembler {
    private context: SdkGeneratorContext;
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.dynamicSnippetsGenerator = this.buildDynamicSnippetsGenerator();
    }

    private buildDynamicSnippetsGenerator(): DynamicSnippetsGenerator {
        const dynamicIr = this.context.ir.dynamic;
        if (!dynamicIr) {
            throw new Error("Cannot generate dynamic snippets without dynamic IR");
        }
        return new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: this.context.config
        });
    }

    public buildReferenceConfigBuilder(): ReferenceConfigBuilder {
        const builder = new ReferenceConfigBuilder();

        Object.entries(this.context.ir.services).forEach(([serviceId, service]) => {
            const section =
                this.context.ir.rootPackage.service === serviceId
                    ? builder.addRootSection()
                    : builder.addSection({ title: this.getReferenceSectionTitle(service) });

            const endpoints = this.getEndpointReferencesForService(service, serviceId);
            for (const endpoint of endpoints) {
                section.addEndpoint(endpoint);
            }
        });

        return builder;
    }

    private getReferenceSectionTitle(service: HttpService): string {
        return (
            service.displayName ?? service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join(" ")
        );
    }

    private getEndpointReferencesForService(
        service: HttpService,
        serviceId: string
    ): FernGeneratorCli.EndpointReference[] {
        return service.endpoints
            .map((endpoint) => {
                const firstExample = this.context.ir.dynamic?.endpoints[endpoint.id]?.examples?.[0];
                if (!firstExample) {
                    return undefined;
                }

                const snippetRequest = convertDynamicEndpointSnippetRequest(firstExample);
                const snippetResponse = this.dynamicSnippetsGenerator.generateSync(snippetRequest);

                return this.getEndpointReference({
                    endpoint,
                    service,
                    serviceId,
                    endpointSnippet: snippetResponse.snippet
                });
            })
            .filter((endpoint): endpoint is FernGeneratorCli.EndpointReference => !!endpoint);
    }

    private getEndpointReference({
        endpoint,
        service,
        serviceId,
        endpointSnippet
    }: {
        endpoint: HttpEndpoint;
        service: HttpService;
        serviceId: string;
        endpointSnippet: string;
    }): FernGeneratorCli.EndpointReference {
        const methodSignature = this.buildMethodSignature(endpoint, service, serviceId);
        const filePath = this.getEndpointFilepath(endpoint, service, serviceId);

        return {
            title: {
                snippetParts: [
                    {
                        text: methodSignature.clientPath
                    },
                    {
                        text: methodSignature.methodName,
                        location: {
                            path: filePath
                        }
                    },
                    {
                        text: methodSignature.parameters
                    }
                ],
                returnValue: { text: methodSignature.returnType }
            },
            description: endpoint.docs,
            snippet: endpointSnippet.trim(),
            parameters: this.buildParameterDocs(endpoint)
        };
    }

    private buildMethodSignature(
        endpoint: HttpEndpoint,
        service: HttpService,
        serviceId: string
    ): {
        clientPath: string;
        methodName: string;
        parameters: string;
        returnType: string;
    } {
        // Build client path: client.users().create() or client.create()
        const servicePath = this.getServicePath(service, serviceId);
        const clientPath = servicePath ? `client.${servicePath}.` : "client.";

        // Method name in snake_case
        const methodName = endpoint.name.snakeCase.safeName;

        // Build parameters - simplified for reference docs
        const parameters = this.buildParameterSignature(endpoint);

        // Return type
        const returnType = this.buildReturnTypeSignature(endpoint);

        return {
            clientPath,
            methodName,
            parameters,
            returnType
        };
    }

    private getServicePath(service: HttpService, serviceId: string): string | undefined {
        // If this is the root service, no path needed
        if (this.context.ir.rootPackage.service === serviceId) {
            return undefined;
        }

        // For subpackage services, use snake_case path
        return service.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName).join("().");
    }

    private buildParameterSignature(endpoint: HttpEndpoint): string {
        const params: string[] = [];

        // Add path parameters
        endpoint.allPathParameters.forEach((pathParam) => {
            const rustType = this.getRustTypeForTypeReference(pathParam.valueType);
            params.push(`${pathParam.name.snakeCase.safeName}: ${rustType}`);
        });

        // Add request body parameter
        if (endpoint.requestBody) {
            if (endpoint.requestBody.type === "inlinedRequestBody") {
                params.push(`request: ${endpoint.requestBody.name.pascalCase.safeName}`);
            } else if (endpoint.requestBody.type === "reference") {
                const typeName = this.getRustTypeForTypeReference(endpoint.requestBody.requestBodyType);
                params.push(`request: ${typeName}`);
            }
        }

        // Add query parameters (if any are required)
        endpoint.queryParameters
            .filter((qp) => !qp.allowMultiple) // Simplified for reference
            .forEach((qp) => {
                const rustType = this.getRustTypeForTypeReference(qp.valueType);
                const optional = qp.allowMultiple ? rustType : `Option<${rustType}>`;
                params.push(`${qp.name.name.snakeCase.safeName}: ${optional}`);
            });

        return `(${params.join(", ")})`;
    }

    private buildReturnTypeSignature(endpoint: HttpEndpoint): string {
        if (endpoint.response?.body) {
            return endpoint.response.body._visit<string>({
                json: (jsonResponse) => {
                    const successType = this.getRustTypeForTypeReference(jsonResponse.responseBodyType);
                    return `Result<${successType}, ApiError>`;
                },
                fileDownload: () => "Result<Vec<u8>, ApiError>",
                text: () => "Result<String, ApiError>",
                bytes: () => "Result<Vec<u8>, ApiError>",
                streaming: () => "Result<Stream<Vec<u8>>, ApiError>",
                streamParameter: () => "Result<Stream<Vec<u8>>, ApiError>",
                _other: () => "Result<(), ApiError>"
            });
        }
        return "Result<(), ApiError>";
    }

    private buildParameterDocs(endpoint: HttpEndpoint): FernGeneratorCli.EndpointReference["parameters"] {
        const params: FernGeneratorCli.EndpointReference["parameters"] = [];

        // Path parameters
        endpoint.allPathParameters.forEach((pathParam) => {
            params.push({
                name: pathParam.name.snakeCase.safeName,
                type: this.getRustTypeForTypeReference(pathParam.valueType),
                required: true,
                description: pathParam.docs
            });
        });

        // Request body parameters
        if (endpoint.requestBody?.type === "inlinedRequestBody") {
            endpoint.requestBody.properties.forEach((prop) => {
                params.push({
                    name: prop.name.name.snakeCase.safeName,
                    type: this.getRustTypeForTypeReference(prop.valueType),
                    required: !this.isOptionalType(prop.valueType),
                    description: prop.docs
                });
            });
        }

        // Query parameters
        endpoint.queryParameters.forEach((qp) => {
            params.push({
                name: qp.name.name.snakeCase.safeName,
                type: this.getRustTypeForTypeReference(qp.valueType),
                required: !qp.allowMultiple,
                description: qp.docs
            });
        });

        return params;
    }

    private getEndpointFilepath(endpoint: HttpEndpoint, service: HttpService, serviceId: string): string {
        // Determine the file location based on service structure
        if (this.context.ir.rootPackage.service === serviceId) {
            // Root service endpoint
            return "/src/client.rs";
        } else {
            // Subpackage service endpoint
            const fernFilepathDir = this.context.getDirectoryForFernFilepath(service.name.fernFilepath);
            return `/src/api/resources/${fernFilepathDir}/client.rs`;
        }
    }

    private getRustTypeForTypeReference(typeRef: TypeReference): string {
        return typeRef._visit<string>({
            primitive: (primitive) => {
                switch (primitive.v1) {
                    case "STRING":
                        return "String";
                    case "INTEGER":
                        return "i64";
                    case "DOUBLE":
                        return "f64";
                    case "BOOLEAN":
                        return "bool";
                    case "UUID":
                        return "String";
                    case "DATE_TIME":
                        return "String";
                    case "DATE":
                        return "String";
                    default:
                        return "String";
                }
            },
            named: (named) => {
                return named.name.pascalCase.safeName;
            },
            container: (container) => {
                return container._visit<string>({
                    list: (listType) => {
                        const innerType = this.getRustTypeForTypeReference(listType.itemType);
                        return `Vec<${innerType}>`;
                    },
                    optional: (optional) => {
                        const innerType = this.getRustTypeForTypeReference(optional);
                        return `Option<${innerType}>`;
                    },
                    nullable: (nullable) => {
                        const innerType = this.getRustTypeForTypeReference(nullable);
                        return `Option<${innerType}>`;
                    },
                    set: (setType) => {
                        const innerType = this.getRustTypeForTypeReference(setType.itemType);
                        return `Vec<${innerType}>`;
                    },
                    map: (map) => {
                        const keyType = this.getRustTypeForTypeReference(map.keyType);
                        const valueType = this.getRustTypeForTypeReference(map.valueType);
                        return `std::collections::HashMap<${keyType}, ${valueType}>`;
                    },
                    literal: (literal) => {
                        return literal._visit<string>({
                            string: () => "String",
                            boolean: () => "bool",
                            _other: () => "String"
                        });
                    },
                    _other: () => "String"
                });
            },
            unknown: () => "serde_json::Value",
            _other: () => "String"
        });
    }

    private isOptionalType(typeRef: TypeReference): boolean {
        return typeRef._visit<boolean>({
            primitive: () => false,
            named: () => false,
            container: (container) => {
                return container._visit<boolean>({
                    list: () => false,
                    optional: () => true,
                    nullable: () => true,
                    set: () => false,
                    map: () => false,
                    literal: () => false,
                    _other: () => false
                });
            },
            unknown: () => false,
            _other: () => false
        });
    }
}
