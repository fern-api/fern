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
        const clientDeclaration = this.generateClientDeclaration(dynamicEndpoint, dynamicEndpointExample);
        const endpointCall = this.generateEndpointMethodCallStatement(dynamicEndpoint, dynamicEndpointExample);

        return {
            moduleName: moduleSymbol.name,
            clientDeclaration: clientDeclaration.toStringWithIndentation(3),
            endpointCall: endpointCall.toStringWithIndentation(3),
            // TODO(kafkas): Implement
            endpointCall400BadRequest: "",
            endpointCall404NotFound: "",
            endpointCallMaxRetriesExhausted: "",
            endpointCallMaxRetries5: "",
            endpointCallMaxRetriesZero: ""
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

    private generateClientDeclaration(
        dynamicEndpoint: dynamic.Endpoint,
        dynamicEndpointExample: dynamic.EndpointExample
    ): swift.Statement {
        const endpointSnippetRequest = convertDynamicEndpointSnippetRequest(dynamicEndpointExample, {
            baseUrlFallback: "https://api.fern.com"
        });
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

    private generateEndpointMethodCallStatement(
        dynamicEndpoint: dynamic.Endpoint,
        dynamicEndpointExample: dynamic.EndpointExample
    ): swift.Statement {
        const endpointSnippetRequest = convertDynamicEndpointSnippetRequest(dynamicEndpointExample);
        return swift.Statement.constantDeclaration({
            unsafeName: "response",
            value: this.endpointSnippetGenerator.generateEndpointMethodCallExpression({
                endpoint: dynamicEndpoint,
                snippet: endpointSnippetRequest
            })
        });
    }
}
