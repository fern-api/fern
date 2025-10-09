import { swift } from "@fern-api/swift-codegen";
import { Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { EndpointMethodGenerator } from "./EndpointMethodGenerator";

export declare namespace SubClientGenerator {
    interface Args {
        clientName: string;
        symbolId: string;
        subpackage: Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class SubClientGenerator {
    private readonly clientName: string;
    private readonly symbolId: string;
    private readonly subpackage: Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly clientGeneratorContext: ClientGeneratorContext;

    public constructor({ clientName, symbolId, subpackage, sdkGeneratorContext }: SubClientGenerator.Args) {
        this.clientName = clientName;
        this.symbolId = symbolId;
        this.subpackage = subpackage;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.clientGeneratorContext = new ClientGeneratorContext({
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
        return swift.initializer({
            parameters: [
                swift.functionParameter({
                    argumentLabel: "config",
                    unsafeName: "config",
                    type: swift.TypeReference.type(swift.Type.custom("ClientConfig"))
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
            parentClassSymbolId: this.symbolId,
            clientGeneratorContext: this.clientGeneratorContext,
            sdkGeneratorContext: this.sdkGeneratorContext
        });
        return (this.service?.endpoints ?? []).map((endpoint) => {
            return endpointMethodGenerator.generateMethod(endpoint);
        });
    }
}
