import { AbstractReadmeSnippetBuilder } from "@fern-api/base-generator";
import { assertDefined, assertNever } from "@fern-api/core-utils";
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
            // Fall back to the first endpoint
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
                            arguments_: this.getMethodArguments(method),
                            multiline: true
                        })
                    )
                )
            )
        ]);
    }

    private getPackageOrSubpackageForEndpoint(endpoint: HttpEndpoint) {
        const rootPackageServiceId = this.context.ir.rootPackage.service;
        if (rootPackageServiceId) {
            const rootPackageService = this.context.getHttpServiceOrThrow(rootPackageServiceId);
            if (rootPackageService.endpoints.some((e) => e.id === endpoint.id)) {
                return this.context.ir.rootPackage;
            }
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

    private getMethodArguments(method: swift.Method) {
        const arguments_: swift.FunctionArgument[] = [];
        for (const param of method.parameters) {
            if (param.argumentLabel === "requestOptions") {
                continue;
            }
            arguments_.push(
                swift.functionArgument({
                    label: param.argumentLabel,
                    value: this.getSampleValue(param.type)
                })
            );
        }
        return arguments_;
    }

    public getSampleValue(type: swift.Type): swift.Expression {
        switch (type.internalType.type) {
            case "string":
                return swift.Expression.rawStringValue("string");
            case "bool":
                return swift.Expression.rawValue("True");
            case "int":
                return swift.Expression.rawValue("123");
            case "int64":
                return swift.Expression.rawValue("123456");
            case "uint":
                return swift.Expression.rawValue("123");
            case "uint64":
                return swift.Expression.rawValue("123456");
            case "float":
                return swift.Expression.rawValue("123.456");
            case "double":
                return swift.Expression.rawValue("123.456");
            case "void":
                return swift.Expression.rawValue("Void");
            case "any":
                return swift.Expression.rawStringValue("abc");
            case "data":
                return swift.Expression.rawValue("Data([1, 2, 3])");
            case "date":
                return swift.Expression.rawValue("Date.now");
            case "uuid":
                return swift.Expression.rawValue("UUID()");
            case "tuple":
                return swift.Expression.tupleLiteral({
                    elements: type.internalType.elements.map((element) => this.getSampleValue(element))
                });
            case "array":
                return swift.Expression.arrayLiteral({
                    elements: [this.getSampleValue(type)]
                });
            case "dictionary":
                return swift.Expression.dictionaryLiteral({
                    entries: [
                        [
                            this.getSampleValue(type.internalType.keyType),
                            this.getSampleValue(type.internalType.valueType)
                        ]
                    ],
                    multiline: true
                });
            case "optional":
                return this.getSampleValue(swift.Type.required(type.internalType.valueType));
            case "arbitrary": {
                const symbol =
                    this.context.project.getSchemaType(type.internalType.name) ??
                    this.context.project.getRequestStruct(type.internalType.name);
                if (symbol) {
                    if (symbol instanceof swift.Struct) {
                        return swift.Expression.structInitialization({
                            unsafeName: symbol.name,
                            arguments_: symbol.properties.map((property) =>
                                swift.functionArgument({
                                    label: property.unsafeName,
                                    value: this.getSampleValue(property.type)
                                })
                            ),
                            multiline: true
                        });
                    } else if (symbol instanceof swift.EnumWithRawValues) {
                        return swift.Expression.enumCaseShorthand(symbol.cases[0]?.unsafeName ?? "unknown");
                    } else if (symbol instanceof swift.EnumWithAssociatedValues) {
                        const firstCase = symbol.cases[0];
                        assertDefined(firstCase);
                        return swift.Expression.contextualMethodCall({
                            methodName: firstCase.unsafeName,
                            arguments_: firstCase.associatedValue.map((c) =>
                                swift.functionArgument({
                                    value: this.getSampleValue(c)
                                })
                            ),
                            multiline: true
                        });
                    }
                }
                return swift.Expression.rawValue(`${type.internalType.name}()`);
            }
            case "existential-any":
                return swift.Expression.rawStringValue("string");
            case "json-value":
                return swift.Expression.rawValue('JSONValue.string("string")');
            default:
                assertNever(type.internalType);
        }
    }
}
