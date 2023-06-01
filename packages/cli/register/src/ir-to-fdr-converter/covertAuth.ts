import { assertNever } from "@fern-api/core-utils";
import * as Ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry-node";

export function convertAuth(auth: Ir.auth.ApiAuth): FernRegistry.api.v1.register.ApiAuth | undefined {
    const scheme = auth.schemes[0];
    if (auth.schemes.length === 1 && scheme != null) {
        switch (scheme._type) {
            case "basic":
                return FernRegistry.api.v1.register.ApiAuth.basicAuth({
                    passwordName: scheme.password.originalName,
                    usernameName: scheme.username.originalName,
                });
            case "bearer":
                return FernRegistry.api.v1.register.ApiAuth.bearerAuth({
                    tokenName: scheme.token.originalName,
                });
            case "header":
                return FernRegistry.api.v1.register.ApiAuth.header({
                    headerWireValue: scheme.name.wireValue,
                    nameOverride: scheme.name.name.originalName,
                });
            default:
                assertNever(scheme);
        }
    }
    return undefined;
}
