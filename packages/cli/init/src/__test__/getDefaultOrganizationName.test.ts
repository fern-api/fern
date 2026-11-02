import { describe, expect, it } from "vitest";

import { getDefaultOrganizationName } from "../getDefaultOrganizationName.js";

describe("getDefaultOrganizationName", () => {
    it("uses the directory name when it is already a valid organization name", () => {
        expect(getDefaultOrganizationName("/home/me/petstore")).toBe("petstore");
    });

    it("lowercases and hyphenates everything an organization name cannot contain", () => {
        expect(getDefaultOrganizationName("/home/me/My API_Docs (v2)")).toBe("my-api-docs-v2");
    });

    it("falls back when nothing usable is left", () => {
        expect(getDefaultOrganizationName("/")).toBe("my-org");
        expect(getDefaultOrganizationName("/home/me/___")).toBe("my-org");
    });
});
