import { FernIrV39 as FernIr } from "@fern-fern/ir-sdk";
import {
    Class_,
    ClassReference,
    Import,
    Property,
    StringClassReference,
    TimeClassReference
} from "@fern-api/ruby-codegen";

export class AccessToken extends Class_ {
    constructor(clientName: string, oauthConfiguration: FernIr.OAuthConfiguration) {
        const properties = [
            new Property({
                name: "access_token",
                type: [StringClassReference]
            }),
            new Property({
                name: "expires_at",
                type: [TimeClassReference],
                isOptional: true
            })
        ];

        if (oauthConfiguration.refreshEndpoint) {
            properties.push(
                new Property({
                    name: "refresh_token",
                    type: [StringClassReference]
                })
            );
        }

        super({
            classReference: new ClassReference({
                name: "AccessToken",
                import_: new Import({ from: "core/oauth", isExternal: false }),
                moduleBreadcrumbs: [clientName]
            }),
            properties
        });
    }
}
