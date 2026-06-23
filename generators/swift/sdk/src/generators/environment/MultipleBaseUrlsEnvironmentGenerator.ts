import { swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

export declare namespace MultipleBaseUrlsEnvironmentGenerator {
    interface Args {
        structName: string;
        environments: FernIr.MultipleBaseUrlsEnvironments;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

/**
 * Generates the environment type for APIs that expose multiple base URLs (server URL templating).
 *
 * Unlike single-base-URL APIs (which generate a `String`-backed enum), each environment here owns
 * one URL per base URL ID, so we generate a struct with one `String` property per base URL plus a
 * static property for each named environment.
 */
export class MultipleBaseUrlsEnvironmentGenerator {
    private readonly structName: string;
    private readonly environments: FernIr.MultipleBaseUrlsEnvironments;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public constructor({ structName, environments, sdkGeneratorContext }: MultipleBaseUrlsEnvironmentGenerator.Args) {
        this.structName = structName;
        this.environments = environments;
        this.sdkGeneratorContext = sdkGeneratorContext;
    }

    public generate(): swift.Struct {
        const environmentSymbol = this.sdkGeneratorContext.project.nameRegistry.getEnvironmentSymbolOrThrow();
        const referencer = this.sdkGeneratorContext.createReferencer(environmentSymbol);
        const stringType = referencer.referenceSwiftType("String");

        const properties = this.environments.baseUrls.map((baseUrl) =>
            swift.property({
                unsafeName: this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name),
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: stringType
            })
        );

        const memberwiseInitializer = swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: this.environments.baseUrls.map((baseUrl) =>
                swift.functionParameter({
                    argumentLabel: this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name),
                    unsafeName: this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name),
                    type: stringType
                })
            ),
            body: swift.codeBlock((writer) => {
                this.environments.baseUrls.forEach((baseUrl) => {
                    const propertyName = this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name);
                    writer.writeLine(`self.${propertyName} = ${propertyName}`);
                });
            })
        });

        const staticEnvironmentProperties = this.environments.environments.map((environment) =>
            swift.property({
                unsafeName: this.sdkGeneratorContext.caseConverter.camelUnsafe(environment.name),
                accessLevel: swift.AccessLevel.Public,
                static_: true,
                declarationType: swift.DeclarationType.Let,
                type: referencer.referenceType(environmentSymbol),
                defaultValue: swift.Expression.structInitialization({
                    unsafeName: this.structName,
                    arguments_: this.environments.baseUrls.map((baseUrl) =>
                        swift.functionArgument({
                            label: this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name),
                            value: swift.Expression.stringLiteral(environment.urls[baseUrl.id] ?? "")
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
            conformances: [swift.Protocol.Equatable, swift.Protocol.Sendable],
            properties: [...properties, ...staticEnvironmentProperties],
            initializers: [memberwiseInitializer]
        });
    }
}
