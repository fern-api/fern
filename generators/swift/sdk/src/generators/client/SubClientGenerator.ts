import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ClientGeneratorContext } from "./ClientGeneratorContext";
import { EndpointMethodGenerator } from "./EndpointMethodGenerator";

export declare namespace SubClientGenerator {
    interface Args {
        clientName: string;
        subpackage: Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class SubClientGenerator {
    private readonly clientName: string;
    private readonly subpackage: Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;
    private readonly clientGeneratorContext: ClientGeneratorContext;

    public constructor({ clientName, subpackage, sdkGeneratorContext }: SubClientGenerator.Args) {
        this.clientName = clientName;
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

    public generate(): SwiftFile {
        const swiftClass = swift.class_({
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
        const fileContents = swiftClass.toString();
        const fernFilepathDir = this.sdkGeneratorContext.getDirectoryForFernFilepath(this.subpackage.fernFilepath);
        return new SwiftFile({
            filename: `${this.clientName}.swift`,
            directory: RelativeFilePath.of(`Resources/${fernFilepathDir}`),
            fileContents
        });
    }

    private generateInitializer(): swift.Initializer {
        return swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: [
                swift.functionParameter({
                    argumentLabel: "config",
                    unsafeName: "config",
                    type: swift.Type.custom("ClientConfig")
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
            clientGeneratorContext: this.clientGeneratorContext
        });
        return (this.service?.endpoints ?? []).map((endpoint) => {
            return endpointMethodGenerator.generateMethod(endpoint);
        });
    }
}
