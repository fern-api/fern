import { Package, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace ClientGeneratorContext {
    interface Args {
        packageOrSubpackage: Package | Subpackage;
        sdkGeneratorContext: SdkGeneratorContext;
    }
}

export class ClientGeneratorContext {
    private readonly packageOrSubpackage: Package | Subpackage;
    private readonly sdkGeneratorContext: SdkGeneratorContext;

    public readonly subClients: { fieldName: string; clientName: string }[];
    public readonly httpClient: { fieldName: string; clientName: string };

    public constructor({ packageOrSubpackage, sdkGeneratorContext }: ClientGeneratorContext.Args) {
        this.packageOrSubpackage = packageOrSubpackage;
        this.sdkGeneratorContext = sdkGeneratorContext;
        this.subClients = this.getSubClients();
        this.httpClient = this.getHttpClient();
    }

    private getSubClients(): { fieldName: string; clientName: string }[] {
        return this.sdkGeneratorContext
            .getSubpackagesOrThrow(this.packageOrSubpackage)
            .filter(([, subpackage]) => subpackage.service != null || subpackage.hasEndpointsInTree)
            .map(([, subpackage]) => {
                const clientName = this.sdkGeneratorContext.getUniqueClientNameForSubpackage(subpackage);
                const fieldName = subpackage.name.snakeCase.safeName;
                return {
                    fieldName,
                    clientName
                };
            });
    }

    private getHttpClient(): { fieldName: string; clientName: string } {
        let fieldName = "http_client";
        const otherFieldNames = new Set(this.subClients.map((client) => client.fieldName));
        while (otherFieldNames.has(fieldName)) {
            fieldName = "_" + fieldName;
        }
        return {
            fieldName,
            clientName: "HttpClient"
        };
    }
}
