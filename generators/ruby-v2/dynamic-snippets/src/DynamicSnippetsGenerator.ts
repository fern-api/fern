import {
    AbstractDynamicSnippetsGenerator,
    AbstractFormatter,
    FernGeneratorExec
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { DynamicSnippetsGeneratorContext } from "./context/DynamicSnippetsGeneratorContext";
import { EndpointSnippetGenerator } from "./EndpointSnippetGenerator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

export class DynamicSnippetsGenerator extends AbstractDynamicSnippetsGenerator<
    DynamicSnippetsGeneratorContext,
    EndpointSnippetGenerator
> {
    private formatter: AbstractFormatter | undefined;

    // Allow for either IntermediateRepresentation or DynamicIntermediateRepresentation 
    // and convert to DynamicIntermediateRepresentation when needed
    // TODO - Chris come back here, likely a better way to handle this conversion
    constructor({
        ir,
        config,
        formatter
    }: {
        ir: IntermediateRepresentation | FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        formatter?: AbstractFormatter;
    }) {
        const dynamicIr = DynamicSnippetsGenerator.isDynamicIr(ir) ? ir : DynamicSnippetsGenerator.convertToDynamicIr(ir);
        super(new DynamicSnippetsGeneratorContext({ ir: dynamicIr, config }));
        this.formatter = formatter;
    }

    private static isDynamicIr(ir: IntermediateRepresentation | FernIr.dynamic.DynamicIntermediateRepresentation): ir is FernIr.dynamic.DynamicIntermediateRepresentation {
        // Type guard to check if the IR is a DynamicIntermediateRepresentation
        // Check a few of the required properties exist that aren't in IntermediateRepresentation
        return 'version' in ir && 'types' in ir && 'endpoints' in ir;
    }

    // TODO: Implement this function to convert IntermediateRepresentation to DynamicIntermediateRepresentation
    private static convertToDynamicIr(ir: IntermediateRepresentation): FernIr.dynamic.DynamicIntermediateRepresentation {
        
        
        // For now, create a minimal conversion that should work
        const endpoints: Record<string, FernIr.dynamic.Endpoint> = {};
        
        // Convert endpoints to the expected format
        Object.values(ir.services).forEach((service: any) => {
            service.endpoints.forEach((endpoint: any) => {
                endpoints[endpoint.name.originalName] = {
                    auth: endpoint.auth,
                    declaration: {
                        fernFilepath: endpoint.name.fernFilepath,
                        name: endpoint.name
                    },
                    location: {
                        method: endpoint.method,
                        path: endpoint.path
                    },
                    request: {
                        inlined: {
                            declaration: {
                                fernFilepath: endpoint.name.fernFilepath,
                                name: endpoint.name
                            },
                            pathParameters: endpoint.pathParameters,
                            queryParameters: endpoint.queryParameters,
                            headers: endpoint.headers,
                            body: endpoint.requestBody
                        }
                    },
                    response: {
                        json: {}
                    },
                    examples: undefined
                } as any;
            });
        });

        return {
            version: "1.0.0",
            types: ir.types as any,
            endpoints,
            environments: undefined,
            headers: undefined,
            pathParameters: undefined,
            generatorConfig: undefined
        };
    }

    public async generate(
        request: FernIr.dynamic.EndpointSnippetRequest
    ): Promise<FernIr.dynamic.EndpointSnippetResponse> {
        return super.generate(request);
    }

    public generateSync(request: FernIr.dynamic.EndpointSnippetRequest): FernIr.dynamic.EndpointSnippetResponse {
        return super.generateSync(request);
    }

    protected createSnippetGenerator(context: DynamicSnippetsGeneratorContext): EndpointSnippetGenerator {
        return new EndpointSnippetGenerator({ context, formatter: this.formatter });
    }
}
