import { Referencer, swift } from "@fern-api/swift-codegen";
import { Subpackage } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { EndpointMethodGenerator } from "./EndpointMethodGenerator";

export declare namespace SubClientGenerator {
    interface Args {
        symbol: swift.Symbol;
        subpackage: Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class SubClientGenerator {
    private readonly symbol: swift.Symbol;
    private readonly subpackage: Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly clientGeneratorContext: ClientGeneratorContext;
    private readonly referencer: Referencer;

    public constructor({ symbol, subpackage, sdkGeneratorContext }: SubClientGenerator.Args) {
        this.referencer = sdkGeneratorContext.createReferencer(symbol);
        this.symbol = symbol;
        this.subpackage = subpackage;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.clientGeneratorContext = new ClientGeneratorContext({
            symbol,
            packageOrSubpackage: subpackage,
            sdkGeneratorContext
        });
    }

    private get service() {
        return this.subpackage.service != null
            ? this.sdkGeneratorContext.getHttpServiceOrThrow(this.subpackage.service)
            : undefined;
    }

    public generate(): swift.Class {
        return swift.class_({
            name: this.symbol.name,
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
        return swift.initializer({
            parameters: [
                swift.functionParameter({
                    argumentLabel: "config",
                    unsafeName: "config",
                    type: this.referencer.referenceAsIsType("ClientConfig")
                })
            ],
            body: swift.CodeBlock.withStatements([
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
            ])
        });
    }

    private generateMethods(): swift.Method[] {
        const endpointMethodGenerator = new EndpointMethodGenerator({
            parentClassSymbol: this.symbol,
            clientGeneratorContext: this.clientGeneratorContext,
            sdkGeneratorContext: this.sdkGeneratorContext
        });
        return (this.service?.endpoints ?? []).map((endpoint) => {
            return endpointMethodGenerator.generateMethod(endpoint);
        });
    }
}
