import { swift } from "@fern-api/swift-codegen";

import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace ClientGeneratorContext {
    interface Args {
        packageOrSubpackage: Package | Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class ClientGeneratorContext {
    private readonly packageOrSubpackage: Package | Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public readonly subClients: { property: swift.Property; clientName: string }[];
    public readonly httpClient: { property: swift.Property; clientName: string };

    public constructor({ packageOrSubpackage, sdkGeneratorContext }: ClientGeneratorContext.Args) {
        this.packageOrSubpackage = packageOrSubpackage;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.subClients = this.getSubClients();
        this.httpClient = this.getHttpClient();
    }

    private getSubClients(): { property: swift.Property; clientName: string }[] {
        const subpackages = this.sdkGeneratorContext.getSubpackagesOrThrow(this.packageOrSubpackage);
        return subpackages.map((subpackage) => {
            const clientName = this.sdkGeneratorContext.getSubClientName(subpackage);
            const property = swift.property({
                unsafeName: subpackage.name.camelCase.unsafeName,
                accessLevel: swift.AccessLevel.Public,
                declarationType: swift.DeclarationType.Let,
                type: swift.Type.custom(clientName)
            });
            return { property, clientName: this.sdkGeneratorContext.getSubClientName(subpackage) };
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
                type: swift.Type.custom("HTTPClient")
            }),
            clientName: "HTTPClient"
        };
    }
}
