import { assertDefined, assertNever } from "@fern-api/core-utils";
import { TestTemplateFileId } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { DynamicSnippetsGenerator, EndpointSnippetGenerator } from "@fern-api/swift-dynamic-snippets";
import { dynamic, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../../utils/convertEndpointSnippetRequest";

export declare namespace TemplateDataGenerator {
    interface Args {
        context: SdkGeneratorContext;
    }
}

export class TemplateDataGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly dynamicIr: dynamic.DynamicIntermediateRepresentation;
    private readonly dynamicSnippetsGenerator: DynamicSnippetsGenerator;
    private readonly endpointSnippetGenerator: EndpointSnippetGenerator;

    public constructor({ context }: TemplateDataGenerator.Args) {
        this.context = context;
        this.dynamicIr = this.getDynamicIrOrThrow();
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: this.dynamicIr,
            config: this.context.config
        });
        this.endpointSnippetGenerator = new EndpointSnippetGenerator({
            context: this.dynamicSnippetsGenerator.context
        });
    }

    private getDynamicIrOrThrow() {
        assertDefined(this.context.ir.dynamic, "Dynamic IR is required to generate wire tests.");
        return this.context.ir.dynamic;
    }

    public generateSourceTemplateData(templateId: swift.SourceTemplateFileId) {
        switch (templateId) {
            case "ClientError":
                return this.generateTemplateDataForClientError();
            case "HTTPClient":
                return this.generateTemplateDataForHTTPClient();
            default:
                assertNever(templateId);
        }
    }

    private generateTemplateDataForClientError() {
        const errorEnumSymbol = this.context.project.nameRegistry.getErrorEnumSymbolOrThrow();
        return {
            errorEnumName: errorEnumSymbol.name
        };
    }

    private generateTemplateDataForHTTPClient() {
        const errorEnumSymbol = this.context.project.nameRegistry.getErrorEnumSymbolOrThrow();
        return {
            errorEnumName: errorEnumSymbol.name
        };
    }

    public generateTestTemplateData(templateId: TestTemplateFileId) {
        switch (templateId) {
            case "ClientErrorTests":
                return this.generateTemplateDataForClientErrorTests();
            case "ClientRetryTests":
                return this.generateTemplateDataForClientRetryTests();
            case "HTTPStub":
                return this.generateTemplateDataForHTTPStub();
            default:
                assertNever(templateId);
        }
    }

    private generateTemplateDataForClientErrorTests() {
        const moduleSymbol = this.context.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        const errorEnumSymbol = this.context.project.nameRegistry.getErrorEnumSymbolOrThrow();
        const clientDeclaration = this.generateRootClientInitializationStatement();
        const endpointCallExpression = this.generateEndpointMethodCallExpression();
        if (!clientDeclaration || !endpointCallExpression) {
            return null;
        }
        return {
            moduleName: moduleSymbol.name,
            errorEnumName: errorEnumSymbol.name,
            clientDeclaration: clientDeclaration.toStringWithIndentation(3),
            endpointCall: swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4)
        };
    }

    private generateTemplateDataForClientRetryTests() {
        const moduleSymbol = this.context.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        const sampleEndpoint = this.getSampleEndpoint();
        const clientDeclaration = this.generateRootClientInitializationStatement();
        const endpointCallExpression = this.generateEndpointMethodCallExpression();
        if (!sampleEndpoint || !clientDeclaration || !endpointCallExpression) {
            return null;
        }
        const { dynamicEndpoint, dynamicEndpointExample } = sampleEndpoint;
        return {
            moduleName: moduleSymbol.name,
            clientDeclaration: clientDeclaration.toStringWithIndentation(3),
            endpointCall: swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCall400BadRequest:
                swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCall404NotFound:
                swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCallMaxRetriesExhausted:
                swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCallMaxRetries5: swift.Statement.discardAssignment(
                this.endpointSnippetGenerator.generateEndpointMethodCallExpression({
                    endpoint: dynamicEndpoint,
                    snippet: convertDynamicEndpointSnippetRequest(dynamicEndpointExample),
                    additionalArguments: [
                        swift.functionArgument({
                            label: "requestOptions",
                            value: swift.Expression.structInitialization({
                                unsafeName: "RequestOptions",
                                arguments_: [
                                    swift.functionArgument({
                                        label: "maxRetries",
                                        value: swift.Expression.numberLiteral(5)
                                    }),
                                    swift.functionArgument({
                                        label: "additionalHeaders",
                                        value: swift.Expression.memberAccess({
                                            target: swift.Expression.reference("stub"),
                                            memberName: "headers"
                                        })
                                    })
                                ]
                            })
                        })
                    ]
                })
            ).toStringWithIndentation(4),
            endpointCallMaxRetriesZero: swift.Statement.discardAssignment(
                this.endpointSnippetGenerator.generateEndpointMethodCallExpression({
                    endpoint: dynamicEndpoint,
                    snippet: convertDynamicEndpointSnippetRequest(dynamicEndpointExample),
                    additionalArguments: [
                        swift.functionArgument({
                            label: "requestOptions",
                            value: swift.Expression.structInitialization({
                                unsafeName: "RequestOptions",
                                arguments_: [
                                    swift.functionArgument({
                                        label: "maxRetries",
                                        value: swift.Expression.numberLiteral(0)
                                    }),
                                    swift.functionArgument({
                                        label: "additionalHeaders",
                                        value: swift.Expression.memberAccess({
                                            target: swift.Expression.reference("stub"),
                                            memberName: "headers"
                                        })
                                    })
                                ]
                            })
                        })
                    ]
                })
            ).toStringWithIndentation(4)
        };
    }

    private generateTemplateDataForHTTPStub() {
        const moduleSymbol = this.context.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        return {
            moduleName: moduleSymbol.name
        };
    }

    private generateRootClientInitializationStatement() {
        const sampleEndpoint = this.getSampleEndpoint();
        if (!sampleEndpoint) {
            return null;
        }
        const { dynamicEndpoint, endpointSnippetRequest } = sampleEndpoint;
        return this.endpointSnippetGenerator.generateRootClientInitializationStatement({
            auth: dynamicEndpoint.auth,
            snippet: endpointSnippetRequest,
            additionalArgs: [
                swift.functionArgument({
                    label: "urlSession",
                    value: swift.Expression.memberAccess({
                        target: swift.Expression.reference("stub"),
                        memberName: "urlSession"
                    })
                })
            ]
        });
    }

    private generateEndpointMethodCallExpression() {
        const sampleEndpoint = this.getSampleEndpoint();
        if (!sampleEndpoint) {
            return null;
        }
        const { dynamicEndpoint, dynamicEndpointExample } = sampleEndpoint;
        return this.endpointSnippetGenerator.generateEndpointMethodCallExpression({
            endpoint: dynamicEndpoint,
            snippet: convertDynamicEndpointSnippetRequest(dynamicEndpointExample),
            additionalArguments: [
                swift.functionArgument({
                    label: "requestOptions",
                    value: swift.Expression.structInitialization({
                        unsafeName: "RequestOptions",
                        arguments_: [
                            swift.functionArgument({
                                label: "additionalHeaders",
                                value: swift.Expression.memberAccess({
                                    target: swift.Expression.reference("stub"),
                                    memberName: "headers"
                                })
                            })
                        ]
                    })
                })
            ]
        });
    }

    private getSampleEndpoint() {
        const endpoint = this.getEndpointForClientRetryTests();
        if (!endpoint) {
            return null;
        }
        const dynamicEndpoint = this.getDynamicEndpointForEndpoint(endpoint);
        const dynamicEndpointExample = dynamicEndpoint.examples?.[0];
        if (!dynamicEndpointExample) {
            return null;
        }
        const endpointSnippetRequest = convertDynamicEndpointSnippetRequest(dynamicEndpointExample, {
            baseUrlFallback: "https://api.fern.com"
        });
        return {
            endpoint,
            dynamicEndpoint,
            dynamicEndpointExample,
            endpointSnippetRequest
        };
    }

    private getEndpointForClientRetryTests() {
        const { services } = this.context.ir;
        for (const serviceId in services) {
            const service = services[serviceId];
            return service?.endpoints[0];
        }
        return undefined;
    }

    private getDynamicEndpointForEndpoint(endpoint: HttpEndpoint) {
        const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
        assertDefined(dynamicEndpoint, "Dynamic endpoint is required to generate wire tests.");
        return dynamicEndpoint;
    }
}
