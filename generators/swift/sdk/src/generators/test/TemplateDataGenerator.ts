import { assertDefined } from "@fern-api/core-utils";
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

    public generateTemplateData(templateFileName: string) {
        if (templateFileName === "ClientRetryTests.Template") {
            return this.generateTemplateDataForClientRetryTests();
        }
        if (templateFileName === "HTTPStub.Template") {
            return this.generateTemplateDataForHTTPStub();
        }
        throw new Error(`Unknown template file "${templateFileName}"`);
    }

    private generateTemplateDataForClientRetryTests() {
        const moduleSymbol = this.context.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
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
        const clientDeclaration = this.endpointSnippetGenerator.generateRootClientInitializationStatement({
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
        const endpointCallExpression = this.endpointSnippetGenerator.generateEndpointMethodCallExpression({
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
