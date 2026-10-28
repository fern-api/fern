import { describe, expect, it } from "vitest";

import { describeOrganization } from "../../org/orgAvailability.js";
import { describeDocsUrl, toSubdomain } from "../checkDocsUrl.js";

describe("docs URL checks", () => {
    it("reads a bare name or a full docs URL", () => {
        expect(toSubdomain("acme")).toBe("acme");
        expect(toSubdomain("acme.docs.buildwithfern.com")).toBe("acme");
        expect(toSubdomain("https://Acme.docs.buildwithfern.com/welcome")).toBe("acme");
        expect(toSubdomain("docs.acme.com")).toBeUndefined();
        expect(toSubdomain("-acme")).toBeUndefined();
    });

    it("explains each result", () => {
        const url = "acme.docs.buildwithfern.com";
        expect(describeDocsUrl({ url, status: "available", suggestions: [] })).toBe(`${url} is free.`);
        expect(describeDocsUrl({ url, status: "mine", suggestions: [] })).toContain("belongs to your organization");
        expect(describeDocsUrl({ url, status: "taken", suggestions: ["acme-docs.docs.buildwithfern.com"] })).toBe(
            `${url} belongs to another team. Free alternatives: acme-docs.docs.buildwithfern.com`
        );
        expect(describeDocsUrl({ url, status: "unknown", suggestions: [] })).toContain("Couldn't check");
    });
});

describe("organization checks", () => {
    it("explains each result, pointing at `fern org create` for a free name", () => {
        expect(describeOrganization({ organization: "acme", status: "available", suggestions: [] })).toBe(
            "acme is free. Create it with `fern org create acme`."
        );
        expect(describeOrganization({ organization: "acme", status: "taken", suggestions: ["acme-dev"] })).toBe(
            "acme belongs to another team. Free names: acme-dev"
        );
        expect(describeOrganization({ organization: "acme", status: "mine", suggestions: [] })).toBe(
            "You belong to acme."
        );
    });
});
