import { Referencer, swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

export declare namespace MultiUrlEnvironmentGenerator {
    interface Args {
        symbol: swift.Symbol;
        environments: FernIr.MultipleBaseUrlsEnvironments;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class MultiUrlEnvironmentGenerator {
    private readonly symbol: swift.Symbol;
    private readonly environments: FernIr.MultipleBaseUrlsEnvironments;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly referencer: Referencer;

    public constructor({ symbol, environments, sdkGeneratorContext }: MultiUrlEnvironmentGenerator.Args) {
        this.symbol = symbol;
        this.environments = environments;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.referencer = sdkGeneratorContext.createReferencer(symbol);
    }

    public generate(): swift.Struct {
        return swift.struct({
            name: this.symbol.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: [...this.generateBaseUrlProperties(), ...this.generateEnvironmentConstants()],
            initializers: [this.generateInitializer()],
            docs: swift.docComment({
                summary:
                    "The environments that the SDK can connect to. Each environment defines a base URL per service."
            })
        });
    }

    private get baseUrlPropertyName(): (baseUrl: FernIr.EnvironmentBaseUrlWithId) => string {
        return (baseUrl) => this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name);
    }

    private generateBaseUrlProperties(): swift.Property[] {
        return this.environments.baseUrls.map((baseUrl) =>
            swift.property({
                unsafeName: this.baseUrlPropertyName(baseUrl),
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: this.referencer.referenceSwiftType("String")
            })
        );
    }

    private generateEnvironmentConstants(): swift.Property[] {
        const selfType = this.referencer.referenceType(this.symbol);
        return this.environments.environments.map((environment) =>
            swift.property({
                unsafeName: this.sdkGeneratorContext.caseConverter.camelUnsafe(environment.name),
                accessLevel: swift.AccessLevel.Public,
                static_: true,
                declarationType: swift.DeclarationType.Let,
                type: selfType,
                defaultValue: swift.Expression.contextualMethodCall({
                    methodName: "init",
                    arguments_: this.environments.baseUrls.map((baseUrl) =>
                        swift.functionArgument({
                            label: this.baseUrlPropertyName(baseUrl),
                            value: swift.Expression.escapedStringLiteral(environment.urls[baseUrl.id] ?? "")
                        })
                    ),
                    multiline: true
                }),
                docs: environment.docs ? swift.docComment({ summary: environment.docs }) : undefined
            })
        );
    }

    private generateInitializer(): swift.Initializer {
        const parameters = this.environments.baseUrls.map((baseUrl) =>
            swift.functionParameter({
                argumentLabel: this.baseUrlPropertyName(baseUrl),
                unsafeName: this.baseUrlPropertyName(baseUrl),
                type: this.referencer.referenceSwiftType("String")
            })
        );
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters,
            body: swift.CodeBlock.withStatements(
                this.environments.baseUrls.map((baseUrl) =>
                    swift.Statement.propertyAssignment(
                        this.baseUrlPropertyName(baseUrl),
                        swift.Expression.reference(this.baseUrlPropertyName(baseUrl))
                    )
                )
            ),
            multiline: true
        });
    }
}
