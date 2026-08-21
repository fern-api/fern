import { assertDefined, assertNever } from "@fern-api/core-utils";
import { TestTemplateFileId } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { DynamicSnippetsGenerator, EndpointSnippetGenerator } from "@fern-api/swift-dynamic-snippets";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import {
    convertDynamicEndpointSnippetRequest,
    EndpointSnippetRequest
} from "../../utils/convertEndpointSnippetRequest.js";
import { areRetriesDisabled } from "../client/util/are-retries-disabled.js";

interface SampleEndpoint {
    endpoint: FernIr.HttpEndpoint;
    dynamicEndpoint: FernIr.dynamic.Endpoint;
    dynamicEndpointExample: FernIr.dynamic.EndpointExample;
    endpointSnippetRequest: EndpointSnippetRequest;
}

export declare namespace TemplateDataGenerator {
    interface Args {
        context: SdkGeneratorContext;
    }
}

export class TemplateDataGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly dynamicIr: FernIr.dynamic.DynamicIntermediateRepresentation;
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
            case "ClientConfig":
                return this.generateTemplateDataForClientConfig();
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

    private generateTemplateDataForClientConfig() {
        return {
            defaultMaxRetries: this.context.customConfig.maxRetries ?? 2
        };
    }

    public generateTestTemplateData(templateId: TestTemplateFileId) {
        switch (templateId) {
            case "ClientErrorTests":
                return this.generateTemplateDataForClientErrorTests();
            case "ClientRetryTests":
                return this.generateTemplateDataForClientRetryTests();
            case "ClientRetriesDisabledTests":
                return this.generateTemplateDataForClientRetriesDisabledTests();
            case "HTTPStub":
                return this.generateTemplateDataForHTTPStub();
            default:
                assertNever(templateId);
        }
    }

    private generateTemplateDataForClientErrorTests() {
        const moduleSymbol = this.context.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        const errorEnumSymbol = this.context.project.nameRegistry.getErrorEnumSymbolOrThrow();
        const sampleEndpoint = this.getSampleEndpoint(this.getEndpointForClientErrorTests());
        if (!sampleEndpoint) {
            return null;
        }
        const clientDeclaration = this.generateRootClientInitializationStatement(sampleEndpoint);
        const endpointCallExpression = this.generateEndpointMethodCallExpression(sampleEndpoint);
        return {
            moduleName: moduleSymbol.name,
            errorEnumName: errorEnumSymbol.name,
            clientDeclaration: clientDeclaration.toStringWithIndentation(3),
            endpointCall: swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4)
        };
    }

    private generateTemplateDataForClientRetryTests() {
        const moduleSymbol = this.context.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        const sampleEndpoint = this.getSampleEndpoint(this.getEndpointForClientRetryTests());
        if (!sampleEndpoint) {
            return null;
        }
        const clientDeclaration = this.generateRootClientInitializationStatement(sampleEndpoint);
        const endpointCallExpression = this.generateEndpointMethodCallExpression(sampleEndpoint);
        const defaultMaxRetries = this.context.customConfig.maxRetries ?? 2;
        return {
            moduleName: moduleSymbol.name,
            defaultMaxRetries,
            maxRetriesExhaustedStubResponses: this.generateMaxRetriesExhaustedStubResponses(defaultMaxRetries),
            clientDeclaration: clientDeclaration.toStringWithIndentation(3),
            endpointCall: swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCall400BadRequest:
                swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCall404NotFound:
                swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCallMaxRetriesExhausted:
                swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCallMaxRetries5: swift.Statement.discardAssignment(
                this.generateEndpointMethodCallExpressionWithMaxRetries(sampleEndpoint, 5)
            ).toStringWithIndentation(4),
            endpointCallMaxRetriesZero: swift.Statement.discardAssignment(
                this.generateEndpointMethodCallExpressionWithMaxRetries(sampleEndpoint, 0)
            ).toStringWithIndentation(4)
        };
    }

    private generateEndpointMethodCallExpressionWithMaxRetries(sampleEndpoint: SampleEndpoint, maxRetries: number) {
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
                                label: "maxRetries",
                                value: swift.Expression.numberLiteral(maxRetries)
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
        });
    }

    private generateTemplateDataForClientRetriesDisabledTests() {
        const moduleSymbol = this.context.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        const sampleEndpoint = this.getSampleEndpoint(this.getEndpointForClientRetriesDisabledTests());
        if (!sampleEndpoint) {
            return null;
        }
        const clientDeclaration = this.generateRootClientInitializationStatement(sampleEndpoint);
        const endpointCallExpression = this.generateEndpointMethodCallExpression(sampleEndpoint);
        return {
            moduleName: moduleSymbol.name,
            clientDeclaration: clientDeclaration.toStringWithIndentation(3),
            endpointCall: swift.Statement.discardAssignment(endpointCallExpression).toStringWithIndentation(4),
            endpointCallMaxRetries5: swift.Statement.discardAssignment(
                this.generateEndpointMethodCallExpressionWithMaxRetries(sampleEndpoint, 5)
            ).toStringWithIndentation(4)
        };
    }

    private generateMaxRetriesExhaustedStubResponses(defaultMaxRetries: number): string {
        const stubLine = '            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Data()),';
        // Need defaultMaxRetries + 2 stub responses so that there are more responses than
        // the client will consume (1 initial + defaultMaxRetries retries = defaultMaxRetries + 1 requests).
        const lines: string[] = [];
        for (let i = 0; i < defaultMaxRetries + 2; i++) {
            lines.push(stubLine);
        }
        return lines.join("\n");
    }

    private generateTemplateDataForHTTPStub() {
        const moduleSymbol = this.context.project.nameRegistry.getRegisteredSourceModuleSymbolOrThrow();
        return {
            moduleName: moduleSymbol.name
        };
    }

    private generateRootClientInitializationStatement(sampleEndpoint: SampleEndpoint) {
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

    private generateEndpointMethodCallExpression(sampleEndpoint: SampleEndpoint) {
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

    private getSampleEndpoint(endpoint: FernIr.HttpEndpoint | undefined): SampleEndpoint | null {
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

    private getEndpointForClientErrorTests() {
        const { services } = this.context.ir;
        for (const serviceId in services) {
            const service = services[serviceId];
            return service?.endpoints[0];
        }
        return undefined;
    }

    /**
     * The retry test suite asserts that requests are retried, so it can only be generated for an
     * endpoint that has retries enabled.
     */
    private getEndpointForClientRetryTests() {
        const { services } = this.context.ir;
        for (const serviceId in services) {
            const service = services[serviceId];
            const endpoint = service?.endpoints.find((endpoint) => !areRetriesDisabled(endpoint.retries));
            if (endpoint) {
                return endpoint;
            }
        }
        return undefined;
    }

    /**
     * The retries-disabled test suite asserts that requests are not retried, so it can only be generated
     * for an endpoint that has retries disabled.
     */
    private getEndpointForClientRetriesDisabledTests() {
        const { services } = this.context.ir;
        for (const serviceId in services) {
            const service = services[serviceId];
            const endpoint = service?.endpoints.find((endpoint) => areRetriesDisabled(endpoint.retries));
            if (endpoint) {
                return endpoint;
            }
        }
        return undefined;
    }

    private getDynamicEndpointForEndpoint(endpoint: FernIr.HttpEndpoint) {
        const dynamicEndpoint = this.dynamicIr.endpoints[endpoint.id];
        assertDefined(dynamicEndpoint, "Dynamic endpoint is required to generate wire tests.");
        return dynamicEndpoint;
    }
}
