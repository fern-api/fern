import { Referencer } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { Package, Subpackage } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace ClientGeneratorContext {
    interface Args {
        symbol: swift.Symbol;
        packageOrSubpackage: Package | Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class ClientGeneratorContext {
    private readonly symbol: swift.Symbol;
    private readonly packageOrSubpackage: Package | Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public readonly httpClient: { property: swift.Property; clientName: string };
    public readonly subClients: { property: swift.Property; clientName: string }[];
    private readonly referencer: Referencer;

    public constructor({ symbol, packageOrSubpackage, sdkGeneratorContext }: ClientGeneratorContext.Args) {
        this.referencer = sdkGeneratorContext.createReferencer(symbol);
        this.symbol = symbol;
        this.packageOrSubpackage = packageOrSubpackage;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.subClients = this.getSubClients();
        this.httpClient = this.getHttpClient();
    }

    private getSubClients(): { property: swift.Property; clientName: string }[] {
        return this.sdkGeneratorContext
            .getSubpackagesOrThrow(this.packageOrSubpackage)
            .map(([subpackageId, subpackage]) => {
                const subClientSymbol =
                    this.sdkGeneratorContext.project.srcNameRegistry.getSubClientSymbolOrThrow(subpackageId);
                const property = swift.property({
                    unsafeName: subpackage.name.camelCase.unsafeName,
                    accessLevel: swift.AccessLevel.Public,
                    declarationType: swift.DeclarationType.Let,
                    type: this.referencer.referenceType(subClientSymbol)
                });
                return {
                    property,
                    clientName: subClientSymbol.name
                };
            });
    }

    private getHttpClient(): { property: swift.Property; clientName: string } {
        let name = "httpClient";
        const otherPropertyNames = new Set(this.subClients.map((p) => p.property.unsafeName));
        while (otherPropertyNames.has(name)) {
            name = "_" + name;
        }
        return {
            property: swift.property({
                unsafeName: name,
                accessLevel: swift.AccessLevel.Private,
                declarationType: swift.DeclarationType.Let,
                type: this.referencer.referenceAsIsType("HTTPClient")
            }),
            clientName: "HTTPClient"
        };
    }
}
