import { constructCasingsGenerator } from "@fern-api/casings-generator";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { describe, expect, it } from "vitest";

import { constructRootApiFileContext } from "../../FernFileContext.js";
import { EndpointResolver } from "../../resolvers/EndpointResolver.js";
import { PropertyResolver } from "../../resolvers/PropertyResolver.js";
import { TypeResolver } from "../../resolvers/TypeResolver.js";
import { convertApiAuth } from "../convertApiAuth.js";

const casingsGenerator = constructCasingsGenerator({
    generationLanguage: undefined,
    keywords: undefined,
    smartCasing: false
});

function convert(rawApiFileSchema: RawSchemas.WithAuthSchema) {
    return convertApiAuth({
        rawApiFileSchema,
        file: constructRootApiFileContext({ casingsGenerator, rootApiFile: { name: "api" } }),
        propertyResolver: {} as PropertyResolver,
        endpointResolver: {} as EndpointResolver,
        typeResolver: {} as TypeResolver
    });
}

describe("convertApiAuth", () => {
    it("uses a declared scheme named `bearer` instead of the built-in shorthand", () => {
        const auth = convert({
            auth: "bearer",
            "auth-schemes": {
                bearer: { scheme: "bearer", token: { name: "apiToken", env: "BEARER_TOKEN", placeholder: "tok" } }
            }
        });

        expect(auth.schemes).toHaveLength(1);
        const scheme = auth.schemes[0];
        expect(scheme?.type).toBe("bearer");
        if (scheme?.type !== "bearer") {
            return;
        }
        expect(scheme.key).toBe("bearer");
        expect(scheme.tokenEnvVar).toBe("BEARER_TOKEN");
        expect(scheme.tokenPlaceholder).toBe("tok");
        expect(scheme.token).toEqual(casingsGenerator.generateName("apiToken"));
    });

    it("keeps the built-in `bearer` shorthand when no scheme is declared under that name", () => {
        const auth = convert({ auth: "bearer" });

        const scheme = auth.schemes[0];
        expect(scheme?.type).toBe("bearer");
        if (scheme?.type !== "bearer") {
            return;
        }
        expect(scheme.tokenEnvVar).toBeUndefined();
        expect(scheme.token).toEqual(casingsGenerator.generateName("token"));
    });

    it("uses a declared scheme named `basic` instead of the built-in shorthand", () => {
        const auth = convert({
            auth: { any: ["basic"] },
            "auth-schemes": {
                basic: { scheme: "basic", username: { env: "ACME_USER" }, password: { env: "ACME_PASS" } }
            }
        });

        const scheme = auth.schemes[0];
        expect(scheme?.type).toBe("basic");
        if (scheme?.type !== "basic") {
            return;
        }
        expect(scheme.usernameEnvVar).toBe("ACME_USER");
        expect(scheme.passwordEnvVar).toBe("ACME_PASS");
    });

    it("keeps the declaration docs of a declared scheme named `bearer`", () => {
        const auth = convert({
            auth: "bearer",
            "auth-schemes": { bearer: { scheme: "bearer", docs: "Use your API token" } }
        });

        expect(auth.schemes[0]?.docs).toBe("Use your API token");
    });

    it("keeps the declaration docs of a declared scheme with a custom name", () => {
        const auth = convert({
            auth: { any: ["ApiKey"] },
            "auth-schemes": { ApiKey: { header: "X-Api-Key", docs: "Your API key" } }
        });

        expect(auth.schemes[0]?.docs).toBe("Your API key");
    });

    it("prefers reference docs over declaration docs", () => {
        const auth = convert({
            auth: { any: [{ scheme: "basic", docs: "Reference docs" }] },
            "auth-schemes": { basic: { scheme: "basic", docs: "Declaration docs" } }
        });

        expect(auth.schemes[0]?.docs).toBe("Reference docs");
    });

    it("lets a declaration named `bearer` define a non-bearer scheme", () => {
        const auth = convert({
            auth: "bearer",
            "auth-schemes": { bearer: { header: "X-Api-Key", type: "string", env: "API_KEY" } }
        });

        const scheme = auth.schemes[0];
        expect(scheme?.type).toBe("header");
        if (scheme?.type !== "header") {
            return;
        }
        expect(scheme.headerEnvVar).toBe("API_KEY");
    });
});
