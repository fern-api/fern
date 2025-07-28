import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointMethodGenerator } from "./EndpointMethodGenerator";

export declare namespace SubClientGenerator {
    interface Args {
        subpackage: Subpackage;
        context: SdkGeneratorContext;
    }
}

export class SubClientGenerator {
    private readonly subpackage: Subpackage;
    private readonly context: SdkGeneratorContext;
    private readonly httpClientPropertyInfo;

    public constructor({ subpackage, context }: SubClientGenerator.Args) {
        this.subpackage = subpackage;
        this.context = context;
        this.httpClientPropertyInfo = this.getHttpClientPropertyInfo();
    }

    private get service() {
        return this.subpackage.service != null
            ? this.context.getHttpServiceOrThrow(this.subpackage.service)
            : undefined;
    }

    private getHttpClientPropertyInfo() {
        const subpackages = this.getSubpackages();
        const otherPropertyNames = new Set(subpackages.map((subpackage) => subpackage.name.camelCase.unsafeName));
        let propertyName = "httpClient";
        while (otherPropertyNames.has(propertyName)) {
            propertyName = "_" + propertyName;
        }
        return {
            propertyName,
            swiftType: swift.Type.custom("HTTPClient")
        };
    }

    private getClientName() {
        return `${this.subpackage.name.pascalCase.unsafeName}Client`;
    }

    private getSubClientName(subpackage: Subpackage) {
        return `${subpackage.name.pascalCase.unsafeName}Client`;
    }

    public generate(): SwiftFile {
        const swiftClass = swift.class_({
            name: this.getClientName(),
            final: true,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: this.generateProperties(),
            initializers: [this.generateInitializer()],
            methods: this.generateMethods()
        });
        const fileContents = swiftClass.toString();
        return new SwiftFile({
            filename: `${this.subpackage.name.pascalCase.safeName}Client.swift`,
            directory: RelativeFilePath.of("Resources"),
            fileContents
        });
    }

    private generateProperties(): swift.Property[] {
        const subpackages = this.getSubpackages();
        return [
            ...subpackages.map((subpackage) => {
                const clientName = this.getSubClientName(subpackage);
                return swift.property({
                    unsafeName: subpackage.name.camelCase.unsafeName,
                    accessLevel: swift.AccessLevel.Public,
                    declarationType: swift.DeclarationType.Let,
                    type: swift.Type.custom(clientName)
                });
            }),
            swift.property({
                unsafeName: this.httpClientPropertyInfo.propertyName,
                accessLevel: swift.AccessLevel.Private,
                declarationType: swift.DeclarationType.Let,
                type: swift.Type.custom("HTTPClient")
            })
        ];
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
                swift.Statement.propertyAssignment(
                    this.httpClientPropertyInfo.propertyName,
                    swift.Expression.classInitialization({
                        unsafeName: "HTTPClient",
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
            httpClientPropertyName: this.httpClientPropertyInfo.propertyName
        });
        return (this.service?.endpoints ?? []).map((endpoint) => {
            return endpointMethodGenerator.generateMethod(endpoint);
        });
    }

    private getSubpackages(): Subpackage[] {
        return this.subpackage.subpackages.map((subpackageId) => {
            return this.context.getSubpackageOrThrow(subpackageId);
        });
    }
}
