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

/**
 * Generates the environment type for APIs whose environments expose multiple
 * named base URLs (e.g. one URL per service). The generated type is a struct
 * with one `String` property per base URL plus a static instance for each
 * declared environment.
 */
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
        const stringType = this.referencer.referenceSwiftType("String");
        const baseUrls = this.environments.baseUrls;

        const urlProperties = baseUrls.map((baseUrl) =>
            swift.property({
                unsafeName: this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name),
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: stringType
            })
        );

        const initializer = swift.initializer({
            accessLevel: swift.AccessLevel.Public,
            parameters: baseUrls.map((baseUrl) => {
                const propertyName = this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name);
                return swift.functionParameter({
                    argumentLabel: propertyName,
                    unsafeName: propertyName,
                    type: stringType
                });
            }),
            body: swift.CodeBlock.withStatements(
                baseUrls.map((baseUrl) => {
                    const propertyName = this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name);
                    return swift.Statement.propertyAssignment(propertyName, swift.Expression.reference(propertyName));
                })
            ),
            multiline: true
        });

        const environmentInstances = this.environments.environments.map((environment) =>
            swift.property({
                unsafeName: this.sdkGeneratorContext.caseConverter.camelUnsafe(environment.name),
                accessLevel: swift.AccessLevel.Public,
                static_: true,
                declarationType: swift.DeclarationType.Let,
                type: this.referencer.referenceType(this.symbol),
                defaultValue: swift.Expression.structInitialization({
                    unsafeName: this.symbol.name,
                    arguments_: baseUrls.map((baseUrl) =>
                        swift.functionArgument({
                            label: this.sdkGeneratorContext.caseConverter.camelUnsafe(baseUrl.name),
                            value: swift.Expression.stringLiteral(environment.urls[baseUrl.id] ?? "")
                        })
                    ),
                    multiline: true
                })
            })
        );

        return swift.struct({
            name: this.symbol.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [swift.Protocol.Sendable],
            properties: [...urlProperties, ...environmentInstances],
            initializers: [initializer]
        });
    }
}
