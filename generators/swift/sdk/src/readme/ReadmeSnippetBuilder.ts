import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { ClientGeneratorContext, EndpointMethodGenerator, RootClientGenerator } from "../generators";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ReadmeSnippetBuilder extends AbstractReadmeSnippetBuilder {
    private readonly context: SdkGeneratorContext;

    public constructor({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: FernGeneratorExec.Endpoint[];
    }) {
        super({ endpointSnippets });
        this.context = context;
    }

    public override getDefaultEndpointId(): EndpointId {
        return this.context.ir.readmeConfig?.defaultEndpoint ?? super.getDefaultEndpointId();
    }

    public buildReadmeSnippets(): Record<FernGeneratorCli.FeatureId, string[]> {
        const snippets: Record<FernGeneratorCli.FeatureId, string[]> = {};
        snippets[FernGeneratorCli.StructuredFeatureId.Usage] = this.buildUsageSnippets();
        return snippets;
    }

    private buildUsageSnippets(): string[] {
        const snippets: string[] = [];
        const usageEndpointIds = this.getEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (usageEndpointIds != null) {
            usageEndpointIds.forEach((endpointId) => {
                const snippet = this.getUsageSnippetForEndpoint(endpointId);
                if (snippet) {
                    snippets.push(snippet);
                }
            });
        } else {
            const snippet = this.getUsageSnippetForEndpoint(this.getDefaultEndpointId());
            if (snippet) {
                snippets.push(snippet);
            }
        }
        return snippets;
    }

    private getEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private getUsageSnippetForEndpoint(endpointId: string) {
        const clientConstantName = "client";
        const allEndpoints = Object.values(this.context.ir.services)
            .map((service) => service.endpoints)
            .flat(1);
        let endpoint = allEndpoints.find((endpoint) => endpoint.id === endpointId);
        if (!endpoint) {
            // Find an endpoint with "POST" method
            endpoint = allEndpoints.find((endpoint) => endpoint.method === "POST");
        }
        if (!endpoint) {
            // Fallback to the first endpoint
            endpoint = allEndpoints[0];
        }
        if (!endpoint) {
            return null;
        }
        const packageOrSubpackage = this.getPackageOrSubpackageForEndpoint(endpoint);
        if (!packageOrSubpackage) {
            return null;
        }
        const endpointMethodGenerator = new EndpointMethodGenerator({
            clientGeneratorContext: new ClientGeneratorContext({
                packageOrSubpackage,
                sdkGeneratorContext: this.context
            }),
            sdkGeneratorContext: this.context
        });
        const method = endpointMethodGenerator.generateMethod(endpoint);
        return SwiftFile.getRawContents([
            swift.Statement.import(this.context.targetName),
            swift.LineBreak.single(),
            this.getRootClientInitializationSnippet(clientConstantName),
            swift.LineBreak.single(),
            swift.Statement.expressionStatement(
                swift.Expression.try(
                    swift.Expression.await(
                        swift.Expression.methodCall({
                            target: swift.Expression.rawValue(clientConstantName),
                            methodName: method.unsafeName,
                            arguments_: [], // TODO(kafkas): Implement
                            multiline: true
                        })
                    )
                )
            )
        ]);
    }

    private getPackageOrSubpackageForEndpoint(endpoint: HttpEndpoint) {
        const rootPackageServiceId = this.context.ir.rootPackage.service;
        if (!rootPackageServiceId) {
            return null;
        }
        const rootPackageService = this.context.getHttpServiceOrThrow(rootPackageServiceId);
        if (rootPackageService.endpoints.some((e) => e.id === endpoint.id)) {
            return this.context.ir.rootPackage;
        }
        for (const subpackage of Object.values(this.context.ir.subpackages)) {
            if (typeof subpackage.service === "string") {
                const service = this.context.getHttpServiceOrThrow(subpackage.service);
                if (service.endpoints.some((e) => e.id === endpoint.id)) {
                    return subpackage;
                }
            }
        }
        return null;
    }

    private getRootClientInitializationSnippet(constantName: string) {
        const { class: rootClientClass, authSchemes } = this.getRootClient();

        const rootClientArgs: swift.FunctionArgument[] = [];

        if (authSchemes.header) {
            rootClientArgs.push(
                swift.functionArgument({
                    label: authSchemes.header.param.argumentLabel,
                    value: swift.Expression.rawStringValue("YOUR_TOKEN")
                })
            );
        }

        if (authSchemes.bearer) {
            rootClientArgs.push(
                swift.functionArgument({
                    label: authSchemes.bearer.stringParam.argumentLabel,
                    value: swift.Expression.rawStringValue("YOUR_TOKEN")
                })
            );
        }

        if (authSchemes.basic) {
            rootClientArgs.push(
                swift.functionArgument({
                    label: authSchemes.basic.usernameParam.argumentLabel,
                    value: swift.Expression.rawStringValue("YOUR_USERNAME")
                })
            );
            rootClientArgs.push(
                swift.functionArgument({
                    label: authSchemes.basic.passwordParam.argumentLabel,
                    value: swift.Expression.rawStringValue("YOUR_PASSWORD")
                })
            );
        }

        return swift.Statement.constantDeclaration({
            unsafeName: constantName,
            value: swift.Expression.classInitialization({
                unsafeName: rootClientClass.name,
                arguments_: rootClientArgs,
                multiline: rootClientArgs.length > 1 ? true : undefined
            })
        });
    }

    private getRootClient() {
        const rootClientGenerator = new RootClientGenerator({
            clientName: this.context.project.symbolRegistry.getRootClientSymbolOrThrow(),
            package_: this.context.ir.rootPackage,
            sdkGeneratorContext: this.context
        });

        return rootClientGenerator.generate();
    }
}
