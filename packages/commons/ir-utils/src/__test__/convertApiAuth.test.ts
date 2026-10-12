import { describe, expect, it } from "vitest";

import { convertApiAuth } from "../auth/convertApiAuth.js";
import { casingsGenerator } from "./utils/makeMinimalIr.js";

describe("convertApiAuth", () => {
    it("uses a declared scheme named `bearer` instead of the built-in shorthand", () => {
        const auth = convertApiAuth({
            rawApiFileSchema: {
                auth: "bearer",
                "auth-schemes": { bearer: { scheme: "bearer", token: { env: "BEARER_TOKEN", placeholder: "tok" } } }
            },
            casingsGenerator
        });

        const scheme = auth.schemes[0];
        expect(scheme?.type).toBe("bearer");
        if (scheme?.type !== "bearer") {
            return;
        }
        expect(scheme.key).toBe("bearer");
        expect(scheme.tokenEnvVar).toBe("BEARER_TOKEN");
        expect(scheme.tokenPlaceholder).toBe("tok");
    });

    it("keeps the built-in `bearer` shorthand when no scheme is declared under that name", () => {
        const auth = convertApiAuth({ rawApiFileSchema: { auth: "bearer" }, casingsGenerator });

        const scheme = auth.schemes[0];
        expect(scheme?.type).toBe("bearer");
        if (scheme?.type !== "bearer") {
            return;
        }
        expect(scheme.tokenEnvVar).toBeUndefined();
    });

    it("uses a declared scheme named `basic` instead of the built-in shorthand", () => {
        const auth = convertApiAuth({
            rawApiFileSchema: {
                auth: "basic",
                "auth-schemes": {
                    basic: { scheme: "basic", username: { env: "ACME_USER" }, password: { env: "ACME_PASS" } }
                }
            },
            casingsGenerator
        });

        const scheme = auth.schemes[0];
        expect(scheme?.type).toBe("basic");
        if (scheme?.type !== "basic") {
            return;
        }
        expect(scheme.usernameEnvVar).toBe("ACME_USER");
        expect(scheme.passwordEnvVar).toBe("ACME_PASS");
    });
});
