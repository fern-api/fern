import { swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

export declare namespace MultiUrlEnvironmentGenerator {
    interface Args {
        structName: string;
        environments: FernIr.MultipleBaseUrlsEnvironments;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class MultiUrlEnvironmentGenerator {
    private readonly structName: string;
    private readonly environments: FernIr.MultipleBaseUrlsEnvironments;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({ structName, environments, sdkGeneratorContext }: MultiUrlEnvironmentGenerator.Args) {
        this.structName = structName;
        this.environments = environments;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    public generate(): swift.Struct {
        const stringType = swift.TypeReference.unqualifiedToSwiftType("String");
        const baseUrlPropertyName = (baseUrl: FernIr.EnvironmentBaseUrlWithId) =>
            this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name);

        const properties = this.environments.baseUrls.map((baseUrl) =>
            swift.property({
                unsafeName: baseUrlPropertyName(baseUrl),
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: stringType
            })
        );

        const initializer = swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: this.environments.baseUrls.map((baseUrl) =>
                swift.functionParameter({
                    argumentLabel: baseUrlPropertyName(baseUrl),
                    unsafeName: baseUrlPropertyName(baseUrl),
                    type: stringType
                })
            ),
            body: swift.CodeBlock.withStatements(
                this.environments.baseUrls.map((baseUrl) =>
                    swift.Statement.propertyAssignment(
                        baseUrlPropertyName(baseUrl),
                        swift.Expression.reference(baseUrlPropertyName(baseUrl))
                    )
                )
            ),
            multiline: true
        });

        const environmentProperties = this.environments.environments.map((environment) =>
            swift.property({
                unsafeName: this.sdkGeneratorContext.caseConverter.camelUnsafe(environment.name),
                accessLevel: swift.AccessLevel.Public,
                static_: true,
                declarationType: swift.DeclarationType.Let,
                type: swift.TypeReference.symbol(this.structName),
                defaultValue: swift.Expression.structInitialization({
                    unsafeName: this.structName,
                    arguments_: this.environments.baseUrls.map((baseUrl) =>
                        swift.functionArgument({
                            label: baseUrlPropertyName(baseUrl),
                            value: swift.Expression.escapedStringLiteral(environment.urls[baseUrl.id] ?? "")
                        })
                    ),
                    multiline: true
                }),
                docs: environment.docs ? swift.docComment({ summary: environment.docs }) : undefined
            })
        );

        return swift.struct({
            name: this.structName,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: [...properties, ...environmentProperties],
            initializers: [initializer]
        });
    }
}
