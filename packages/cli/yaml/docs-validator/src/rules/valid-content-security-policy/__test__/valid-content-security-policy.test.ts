import { docsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";

const SHA256 = "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";

describe("getContentSecurityPolicyErrors", () => {
    it("accepts no hashes, an empty list and valid hashes", () => {
        expect(docsYml.getContentSecurityPolicyErrors(undefined)).toEqual([]);
        expect(docsYml.getContentSecurityPolicyErrors([])).toEqual([]);
        expect(docsYml.getContentSecurityPolicyErrors([SHA256])).toEqual([]);
    });

    it.each([
        `'${SHA256}'`,
        `${SHA256} `,
        "sha256-abc=",
        "md5-1B2M2Y8AsgTpgAmY7PhCfg==",
        `${SHA256}; script-src *`,
        "'unsafe-inline'",
        "https:",
        ""
    ])("rejects %j", (hash) => {
        const errors = docsYml.getContentSecurityPolicyErrors([hash]);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("style-hashes[0]");
    });

    it("rejects more than 16 hashes", () => {
        expect(docsYml.getContentSecurityPolicyErrors(Array.from({ length: 17 }, () => SHA256))).toHaveLength(1);
    });
});
