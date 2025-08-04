import { assertNever } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { Package } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { EndpointMethodGenerator } from "./EndpointMethodGenerator";

export declare namespace RootClientGenerator {
    interface Args {
        clientName: string;
        package_: Package;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class RootClientGenerator {
    private readonly clientName: string;
    private readonly package_: Package;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly clientGeneratorContext: ClientGeneratorContext;

    public constructor({ clientName, package_, sdkGeneratorContext }: RootClientGenerator.Args) {
        this.clientName = clientName;
        this.package_ = package_;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.clientGeneratorContext = new ClientGeneratorContext({
            packageOrSubpackage: package_,
            sdkGeneratorContext
        });
    }

    private get service() {
        return this.package_.service != null
            ? this.sdkGeneratorContext.getHttpServiceOrThrow(this.package_.service)
            : undefined;
    }

    public generate(): swift.Class {
        return swift.class_({
            name: this.clientName,
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: [
                ...this.clientGeneratorContext.subClients.map(({ property }) => property),
                this.clientGeneratorContext.httpClient.property
            ],
            initializers: [this.generateInitializer()],
            methods: this.generateMethods()
        });
    }

    private generateInitializer(): swift.Initializer {
        let defaultBaseUrlValue: swift.Expression | undefined;

        if (this.sdkGeneratorContext.ir.environments) {
            if (this.sdkGeneratorContext.ir.environments.environments.type === "singleBaseUrl") {
                const defaultEnvId = this.sdkGeneratorContext.ir.environments.defaultEnvironment;

                // If no default environment is specified, use the first environment
                const defaultEnvironment = this.sdkGeneratorContext.ir.environments.environments.environments.find(
                    (e, idx) => (defaultEnvId == null ? idx === 0 : e.id === defaultEnvId)
                );
                if (defaultEnvironment != null) {
                    defaultBaseUrlValue = swift.Expression.memberAccess({
                        target: swift.Expression.reference(
                            this.sdkGeneratorContext.project.symbolRegistry.getEnvironmentSymbolOrThrow()
                        ),
                        memberName: `${defaultEnvironment.name.camelCase.unsafeName}.rawValue`
                    });
                }
            } else if (this.sdkGeneratorContext.ir.environments.environments.type === "multipleBaseUrls") {
                // TODO(kafkas): Handle multiple environments
            } else {
                assertNever(this.sdkGeneratorContext.ir.environments.environments);
            }
        }

        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "baseURL",
                    unsafeName: "baseURL",
                    type: swift.Type.string(),
                    defaultValue: defaultBaseUrlValue
                }),
                swift.functionParameter({
                    argumentLabel: "apiKey",
                    unsafeName: "apiKey",
                    type: swift.Type.string()
                }),
                swift.functionParameter({
                    argumentLabel: "token",
                    unsafeName: "token",
                    type: swift.Type.optional(swift.Type.string()),
                    defaultValue: swift.Expression.rawValue("nil")
                }),
                swift.functionParameter({
                    argumentLabel: "headers",
                    unsafeName: "headers",
                    type: swift.Type.optional(swift.Type.dictionary(swift.Type.string(), swift.Type.string())),
                    defaultValue: swift.Expression.rawValue("[:]")
                }),
                swift.functionParameter({
                    argumentLabel: "timeout",
                    unsafeName: "timeout",
                    type: swift.Type.optional(swift.Type.int()),
                    defaultValue: swift.Expression.rawValue("nil")
                }),
                swift.functionParameter({
                    argumentLabel: "maxRetries",
                    unsafeName: "maxRetries",
                    type: swift.Type.optional(swift.Type.int()),
                    defaultValue: swift.Expression.rawValue("nil")
                }),
                swift.functionParameter({
                    argumentLabel: "urlSession",
                    unsafeName: "urlSession",
                    type: swift.Type.optional(swift.Type.custom("URLSession")),
                    defaultValue: swift.Expression.rawValue("nil")
                })
            ],
            body: swift.CodeBlock.withStatements([
                swift.Statement.constantDeclaration({
                    unsafeName: "config",
                    value: swift.Expression.classInitialization({
                        unsafeName: "ClientConfig",
                        arguments_: [
                            swift.functionArgument({
                                label: "baseURL",
                                value: swift.Expression.reference("baseURL")
                            }),
                            swift.functionArgument({
                                label: "apiKey",
                                value: swift.Expression.reference("apiKey")
                            }),
                            swift.functionArgument({
                                label: "token",
                                value: swift.Expression.reference("token")
                            }),
                            swift.functionArgument({
                                label: "headers",
                                value: swift.Expression.reference("headers")
                            }),
                            swift.functionArgument({
                                label: "timeout",
                                value: swift.Expression.reference("timeout")
                            }),
                            swift.functionArgument({
                                label: "urlSession",
                                value: swift.Expression.reference("urlSession")
                            })
                        ],
                        multiline: true
                    })
                }),
                ...this.clientGeneratorContext.subClients.map(({ property, clientName }) =>
                    swift.Statement.propertyAssignment(
                        property.unsafeName,
                        swift.Expression.classInitialization({
                            unsafeName: clientName,
                            arguments_: [
                                swift.functionArgument({ label: "config", value: swift.Expression.reference("config") })
                            ]
                        })
                    )
                ),
                swift.Statement.propertyAssignment(
                    this.clientGeneratorContext.httpClient.property.unsafeName,
                    swift.Expression.classInitialization({
                        unsafeName: this.clientGeneratorContext.httpClient.clientName,
                        arguments_: [
                            swift.functionArgument({ label: "config", value: swift.Expression.reference("config") })
                        ]
                    })
                )
            ]),
            multiline: true
        });
    }

    private generateMethods(): swift.Method[] {
        const endpointMethodGenerator = new EndpointMethodGenerator({
            clientGeneratorContext: this.clientGeneratorContext,
            sdkGeneratorContext: this.sdkGeneratorContext
        });
        return (this.service?.endpoints ?? []).map((endpoint) => {
            return endpointMethodGenerator.generateMethod(endpoint);
        });
    }
}
