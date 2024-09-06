import { assertNever } from "@fern-api/core-utils";
import { FernIr as Ir } from "@fern-api/ir-sdk";
import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";

export function convertAuth(auth: Ir.auth.ApiAuth, ir: Ir.ir.IntermediateRepresentation): FdrCjsSdk.api.v1.register.ApiAuth | undefined {
    const scheme = auth.schemes[0];
    if (auth.schemes.length === 1 && scheme != null) {
        switch (scheme.type) {
            case "basic":
                return {
                    type: "basicAuth",
                    passwordName: scheme.password.originalName,
                    usernameName: scheme.username.originalName
                };
            case "bearer":
                return {
                    type: "bearerAuth",
                    tokenName: scheme.token.originalName
                };
            case "header":
                return {
                    type: "header",
                    headerWireValue: scheme.name.wireValue,
                    nameOverride: scheme.name.name.originalName,
                    prefix: scheme.prefix
                };
            case "oauth":
                // TODO: alter if we support more than one scheme

                // We have to do the following, since the id passed on resolved endpoints is originalName
                let endpointId = scheme.configuration.tokenEndpoint.endpointReference.endpointId;
                for (const irService of Object.values(ir.services)) {
                    for (const irEndpoint of irService.endpoints) {
                        if (irEndpoint.id === scheme.configuration.tokenEndpoint.endpointReference.endpointId) {
                            endpointId = irEndpoint.name.originalName;
                    }
                } 
                
                return {
                    type: "oAuth",
                    value: {
                        type: "clientCredentials",
                        value: {
                            type: "definedEndpoint",
                            endpointId,
                            accessTokenLocation: scheme.configuration.tokenEndpoint.responseProperties.accessToken.propertyPath,
                            tokenPrefix: scheme.configuration.tokenPrefix
                        }
                    }
                };
            default:
                assertNever(scheme);
        }
    }
    return undefined; 
}
