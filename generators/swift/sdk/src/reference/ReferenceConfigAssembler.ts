import { ReferenceConfigBuilder } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { DynamicSnippetsGenerator } from "@fern-api/swift-dynamic-snippets";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";

import { ClientGeneratorContext, EndpointMethodGenerator } from "../generators";
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
            const endpoints = this.getEndpointReferencesForService(service);
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

    private getEndpointReferencesForService(service: HttpService): FernGeneratorCli.EndpointReference[] {
        return service.endpoints
            .map((endpoint) => {
                const endpointContainer = this.context.getEndpointContainer(endpoint);
                if (endpointContainer.type === "none") {
                    throw new Error(`Internal error; missing package or subpackage for endpoint ${endpoint.id}`);
                }
                const rootClientSymbol = this.context.project.srcNameRegistry.getRootClientSymbolOrThrow();
                const clientGeneratorContext = new ClientGeneratorContext({
                    symbol: rootClientSymbol,
                    packageOrSubpackage:
                        endpointContainer.type === "root-package"
                            ? endpointContainer.package
                            : endpointContainer.subpackage,
                    sdkGeneratorContext: this.context
                });
                const endpointMethodGenerator = new EndpointMethodGenerator({
                    parentClassSymbol: rootClientSymbol,
                    clientGeneratorContext,
                    sdkGeneratorContext: this.context
                });
                const endpointMethod = endpointMethodGenerator.generateMethod(endpoint);
                const firstExample = this.context.ir.dynamic?.endpoints[endpoint.id]?.examples?.[0];
                if (!firstExample) {
                    return undefined;
                }
                const snippetRequest = convertDynamicEndpointSnippetRequest(firstExample);
                const snippetResponse = this.dynamicSnippetsGenerator.generateSync(snippetRequest);
                return this.getEndpointReference({
                    endpoint,
                    endpointMethod,
                    endpointSnippet: snippetResponse.snippet
                });
            })
            .filter((endpoint): endpoint is FernGeneratorCli.EndpointReference => !!endpoint);
    }

    private getEndpointReference({
        endpoint,
        endpointMethod,
        endpointSnippet
    }: {
        endpoint: HttpEndpoint;
        endpointMethod: swift.Method;
        endpointSnippet: string;
    }): FernGeneratorCli.EndpointReference {
        const { methodName, leadingParts } = this.context.getEndpointMethodDetails(endpoint);
        return {
            title: {
                snippetParts: [
                    {
                        text: ["client", ...leadingParts].join(".") + "."
                    },
                    {
                        text: methodName,
                        location: {
                            path: this.getEndpointFilepath(endpoint)
                        }
                    },
                    {
                        text: this.getReferenceEndpointInvocationParameters(endpointMethod)
                    }
                ],
                returnValue: { text: endpointMethod.returnType.toString() }
            },
            description: endpoint.docs,
            snippet: endpointSnippet.trim(),
            parameters: endpointMethod.parameters.map((p) => ({
                name: p.unsafeName,
                type: p.type.toString(),
                required: !p.type.isOptional,
                description: p.docsContent
            }))
        };
    }

    private getReferenceEndpointInvocationParameters(method: swift.Method): string {
        const paramsJoined = method.parameters.map((p) => `${p.unsafeName}: ${p.type.toString()}`).join(", ");
        return `(${paramsJoined})`;
    }

    private getEndpointFilepath(endpoint: HttpEndpoint): string {
        const endpointContainer = this.context.getEndpointContainer(endpoint);
        if (endpointContainer.type === "none") {
            throw new Error(`Internal error; missing package or subpackage for endpoint ${endpoint.id}`);
        } else if (endpointContainer.type === "root-package") {
            const rootClientSymbol = this.context.project.srcNameRegistry.getRootClientSymbolOrThrow();
            return `/${this.context.project.sourcesDirectory}/${rootClientSymbol.name}.swift`;
        } else if (endpointContainer.type === "subpackage") {
            const subClientSymbol = this.context.project.srcNameRegistry.getSubClientSymbolOrThrow(
                endpointContainer.subpackageId
            );
            const fernFilepathDir = this.context.getDirectoryForFernFilepath(endpointContainer.subpackage.fernFilepath);
            return `/${this.context.project.sourcesDirectory}/${this.context.resourcesDirectory}/${fernFilepathDir}/${subClientSymbol.name}.swift`;
        } else {
            assertNever(endpointContainer);
        }
    }
}
