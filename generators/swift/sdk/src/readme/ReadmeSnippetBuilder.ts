import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private static readonly REQUEST_TYPES_FEATURE_ID: FernGeneratorCli.FeatureId = "REQUEST_TYPES";
    private static readonly ADDITIONAL_HEADERS_FEATURE_ID: FernGeneratorCli.FeatureId = "ADDITIONAL_HEADERS";
    private static readonly ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID: FernGeneratorCli.FeatureId =
        "ADDITIONAL_QUERY_STRING_PARAMETERS";
    private static readonly CUSTOM_NETWORKING_CLIENT_FEATURE_ID: FernGeneratorCli.FeatureId =
        "CUSTOM_NETWORKING_CLIENT";

    private readonly context: SdkGeneratorContext;
    private readonly endpointsById: Record<string, HttpEndpoint>;
    private readonly endpointSnippetsById: Record<string, FernGeneratorExec.Endpoint>;

    public constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;
        this.endpointsById = this.buildEndpoints();
        this.endpointSnippetsById = Object.fromEntries(
            endpointSnippets.map((snippet) => [snippet.id.identifierOverride, snippet])
        );
    }

    private buildEndpoints(): Record<EndpointId, HttpEndpoint> {
        const endpoints: Record<EndpointId, HttpEndpoint> = {};
        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                endpoints[endpoint.id] = endpoint;
            }
        }
        return endpoints;
    }

    public override getDefaultEndpointId(): EndpointId {
        return this.context.ir.readmeConfig?.defaultEndpoint ?? super.getDefaultEndpointId();
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();
        snippets[ReadmeSnippetBuilder.REQUEST_TYPES_FEATURE_ID] = this.buildRequestTypesSnippets();
        snippets[ReadmeSnippetBuilder.ADDITIONAL_HEADERS_FEATURE_ID] = this.buildAdditionalHeadersSnippets();
        snippets[ReadmeSnippetBuilder.ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID] =
            this.buildAdditionalQueryStringParametersSnippets();
        snippets[FernGeneratorCli.StructuredFeatureId.Timeouts] = this.buildTimeoutsSnippets();
        snippets[ReadmeSnippetBuilder.CUSTOM_NETWORKING_CLIENT_FEATURE_ID] = this.buildCustomNetworkingClientSnippets();
        return snippets;
    }

    private buildUsageSnippets(): string[] {
        const snippets: string[] = [];
        const usageEndpointIds = this.getEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);

        usageEndpointIds.forEach((endpointId) => {
            const snippet = this.getUsageSnippetForEndpoint(endpointId);
            // Snippets are marked as 'typescript' for compatibility with FernGeneratorExec, which will be deprecated.
            if (snippet?.type === "typescript") {
                snippets.push(snippet.client);
            }
        });

        return snippets;
    }

    private buildRequestTypesSnippets(): string[] {
        const moduleSymbol = this.context.project.srcNameRegistry.getModuleSymbolOrThrow();
        const [firstRequestTypeSymbol] = this.context.project.srcNameRegistry.getAllRequestTypeSymbols();
        if (firstRequestTypeSymbol == null) {
            return [];
        }
        const requestTypeRef = this.context.project.srcNameRegistry.reference({
            fromSymbolId: moduleSymbol.id,
            toSymbolId: firstRequestTypeSymbol.id
        });
        const content = SwiftFile.getRawContents([
            swift.Statement.import(moduleSymbol.name),
            swift.LineBreak.single(),
            swift.Statement.constantDeclaration({
                unsafeName: "request",
                value: swift.Expression.structInitialization({
                    unsafeName: requestTypeRef,
                    arguments_: [
                        swift.functionArgument({
                            value: swift.Expression.rawValue("...")
                        })
                    ],
                    multiline: true
                })
            })
        ]);
        return [content];
    }

    private buildAdditionalHeadersSnippets(): string[] {
        return this.getEndpointIdsForFeature(ReadmeSnippetBuilder.ADDITIONAL_HEADERS_FEATURE_ID).map((endpointId) => {
            const endpoint = this.endpointsById[endpointId];
            if (endpoint == null) {
                throw new Error(`Internal error; missing endpoint ${endpointId}`);
            }
            return SwiftFile.getRawContents([
                swift.Statement.expressionStatement(
                    swift.Expression.try(
                        swift.Expression.await(
                            swift.Expression.methodCall({
                                target: swift.Expression.reference("client"),
                                methodName: this.context.getEndpointMethodDetails(endpoint).fullyQualifiedMethodName,
                                arguments_: [
                                    swift.functionArgument({ value: swift.Expression.rawValue("...") }),
                                    swift.functionArgument({
                                        label: "requestOptions",
                                        value: swift.Expression.contextualMethodCall({
                                            methodName: "init",
                                            arguments_: [
                                                swift.functionArgument({
                                                    label: "additionalHeaders",
                                                    value: swift.Expression.dictionaryLiteral({
                                                        entries: [
                                                            [
                                                                swift.Expression.stringLiteral("X-Custom-Header"),
                                                                swift.Expression.stringLiteral("custom value")
                                                            ]
                                                        ],
                                                        multiline: true
                                                    })
                                                })
                                            ],
                                            multiline: true
                                        })
                                    })
                                ]
                            })
                        )
                    )
                )
            ]);
        });
    }

    private buildAdditionalQueryStringParametersSnippets(): string[] {
        return this.getEndpointIdsForFeature(ReadmeSnippetBuilder.ADDITIONAL_QUERY_STRING_PARAMETERS_FEATURE_ID).map(
            (endpointId) => {
                const endpoint = this.endpointsById[endpointId];
                if (endpoint == null) {
                    throw new Error(`Internal error; missing endpoint ${endpointId}`);
                }
                return SwiftFile.getRawContents([
                    swift.Statement.expressionStatement(
                        swift.Expression.try(
                            swift.Expression.await(
                                swift.Expression.methodCall({
                                    target: swift.Expression.reference("client"),
                                    methodName:
                                        this.context.getEndpointMethodDetails(endpoint).fullyQualifiedMethodName,
                                    arguments_: [
                                        swift.functionArgument({ value: swift.Expression.rawValue("...") }),
                                        swift.functionArgument({
                                            label: "requestOptions",
                                            value: swift.Expression.contextualMethodCall({
                                                methodName: "init",
                                                arguments_: [
                                                    swift.functionArgument({
                                                        label: "additionalQueryParameters",
                                                        value: swift.Expression.dictionaryLiteral({
                                                            entries: [
                                                                [
                                                                    swift.Expression.stringLiteral(
                                                                        "custom_query_param_key"
                                                                    ),
                                                                    swift.Expression.stringLiteral(
                                                                        "custom_query_param_value"
                                                                    )
                                                                ]
                                                            ],
                                                            multiline: true
                                                        })
                                                    })
                                                ],
                                                multiline: true
                                            })
                                        })
                                    ]
                                })
                            )
                        )
                    )
                ]);
            }
        );
    }

    private buildTimeoutsSnippets(): string[] {
        return this.getEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Timeouts).map((endpointId) => {
            const endpoint = this.endpointsById[endpointId];
            if (endpoint == null) {
                throw new Error(`Internal error; missing endpoint ${endpointId}`);
            }
            return SwiftFile.getRawContents([
                swift.Statement.expressionStatement(
                    swift.Expression.try(
                        swift.Expression.await(
                            swift.Expression.methodCall({
                                target: swift.Expression.reference("client"),
                                methodName: this.context.getEndpointMethodDetails(endpoint).fullyQualifiedMethodName,
                                arguments_: [
                                    swift.functionArgument({ value: swift.Expression.rawValue("...") }),
                                    swift.functionArgument({
                                        label: "requestOptions",
                                        value: swift.Expression.contextualMethodCall({
                                            methodName: "init",
                                            arguments_: [
                                                swift.functionArgument({
                                                    label: "timeout",
                                                    value: swift.Expression.numberLiteral(30)
                                                })
                                            ],
                                            multiline: true
                                        })
                                    })
                                ]
                            })
                        )
                    )
                )
            ]);
        });
    }

    private buildCustomNetworkingClientSnippets(): string[] {
        const moduleSymbol = this.context.project.srcNameRegistry.getModuleSymbolOrThrow();
        const rootClientSymbol = this.context.project.srcNameRegistry.getRootClientSymbolOrThrow();
        const content = SwiftFile.getRawContents([
            swift.Statement.import("Foundation"),
            swift.Statement.import(moduleSymbol.name),
            swift.LineBreak.single(),
            swift.Statement.constantDeclaration({
                unsafeName: "client",
                value: swift.Expression.structInitialization({
                    unsafeName: rootClientSymbol.name,
                    arguments_: [
                        swift.functionArgument({ value: swift.Expression.rawValue("...") }),
                        swift.functionArgument({
                            label: "urlSession",
                            value: swift.Expression.rawValue("// Provide your implementation here")
                        })
                    ],
                    multiline: true
                })
            })
        ]);
        return [content];
    }

    private getUsageSnippetForEndpoint(endpointId: string) {
        return this.endpointSnippetsById[endpointId]?.snippet;
    }

    private getEndpointIdsForFeature(featureId: FeatureId): EndpointId[] {
        const endpointIds = this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
        if (endpointIds == null) {
            return [this.getDefaultEndpointId()];
        }
        return endpointIds;
    }
}
