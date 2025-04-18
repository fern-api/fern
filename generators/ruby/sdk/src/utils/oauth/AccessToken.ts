import {
    ClassReference,
    Class_,
    Import,
    Property,
    StringClassReference,
    TimeClassReference
} from "@fern-api/ruby-codegen";

import { OAuthConfiguration } from "@fern-fern/ir-sdk/api";

export class AccessToken extends Class_ {
    constructor(clientName: string, oauthConfiguration: OAuthConfiguration) {
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
