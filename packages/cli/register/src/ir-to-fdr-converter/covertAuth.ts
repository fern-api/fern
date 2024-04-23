import { assertNever } from "@fern-api/core-utils";
import { APIV1Write } from "@fern-api/fdr-sdk";
import { FernIr as Ir } from "@fern-api/ir-sdk";

export function convertAuth(auth: Ir.auth.ApiAuth): APIV1Write.ApiAuth | undefined {
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
                // TODO: Add support oauth for FDR. For now, we just map
                //       it to the default bearer auth.
                return {
                    type: "bearerAuth",
                    tokenName: "token"
                };
            default:
                assertNever(scheme);
        }
    }
    return undefined;
}
