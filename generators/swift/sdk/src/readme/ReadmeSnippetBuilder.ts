import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { FernGeneratorCli } from "@fern-fern/generator-cli-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EndpointId, FeatureId } from "@fern-fern/ir-sdk/api";

import { RootClientGenerator } from "../generators";
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
        const usageEndpointIds = this.getEndpointIdsForFeature(FernGeneratorCli.StructuredFeatureId.Usage);
        if (usageEndpointIds != null) {
            return usageEndpointIds.map((endpointId) => this.getUsageSnippetForEndpoint(endpointId));
        }
        return [this.getUsageSnippetForEndpoint(this.getDefaultEndpointId())];
    }

    private getEndpointIdsForFeature(featureId: FeatureId): EndpointId[] | undefined {
        return this.context.ir.readmeConfig?.features?.[this.getFeatureKey(featureId)];
    }

    private getUsageSnippetForEndpoint(endpointId: string) {
        const clientConstantName = "client";

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
                            methodName: "doSomething", // TODO(kafkas): Implement
                            arguments_: [], // TODO(kafkas): Implement
                            multiline: true
                        })
                    )
                )
            )
        ]);
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
