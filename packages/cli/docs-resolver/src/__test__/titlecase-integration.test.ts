/**
 * Integration test: verifies that the titleCase function imported from @fern-api/core-utils
 * (the local fixed version) correctly handles single uppercase letters in subpackage names.
 *
 * This test validates the exact code path used by ApiReferenceNodeConverter when generating
 * navigation titles for subpackages (lines that use `subpackage.displayName ?? titleCase(subpackage.name)`).
 *
 * The critical fix was changing the import from @fern-api/ui-core-utils (npm, unfixed)
 * to @fern-api/core-utils (local workspace, fixed) in ApiReferenceNodeConverter.ts.
 */
import { titleCase } from "@fern-api/core-utils";

describe("titleCase integration for ApiReferenceNodeConverter", () => {
    // Simulates the `subpackage.displayName ?? titleCase(subpackage.name)` pattern
    // used in #convertApiDefinitionPackage and #convertPackage
    function getSubpackageTitle(subpackage: { displayName?: string | null; name: string }): string {
        return subpackage.displayName ?? titleCase(subpackage.name);
    }

    it("correctly title-cases subpackage name with single letter 'A' (the original bug)", () => {
        expect(getSubpackageTitle({ name: "segmentsForAShopperProfile" })).toBe("Segments for a Shopper Profile");
    });

    it("correctly title-cases 'shopperProfilesForASegment'", () => {
        expect(getSubpackageTitle({ name: "shopperProfilesForASegment" })).toBe("Shopper Profiles for a Segment");
    });

    it("uses displayName when provided instead of titleCase", () => {
        expect(getSubpackageTitle({ name: "segmentsForAShopperProfile", displayName: "Custom Display Name" })).toBe(
            "Custom Display Name"
        );
    });

    it("falls back to titleCase when displayName is null", () => {
        expect(getSubpackageTitle({ name: "segmentsForAShopperProfile", displayName: null })).toBe(
            "Segments for a Shopper Profile"
        );
    });

    it("handles acronyms correctly in subpackage names", () => {
        expect(getSubpackageTitle({ name: "getAPIKey" })).toBe("Get API Key");
        expect(getSubpackageTitle({ name: "HTMLParser" })).toBe("HTML Parser");
        expect(getSubpackageTitle({ name: "parseXMLToJSON" })).toBe("Parse XML to JSON");
    });

    it("handles standard camelCase subpackage names", () => {
        expect(getSubpackageTitle({ name: "getUserProfile" })).toBe("Get User Profile");
        expect(getSubpackageTitle({ name: "deleteAUser" })).toBe("Delete a User");
    });

    it("handles snake_case subpackage names", () => {
        expect(getSubpackageTitle({ name: "get_user_profile" })).toBe("Get User Profile");
    });

    it("handles kebab-case subpackage names", () => {
        expect(getSubpackageTitle({ name: "get-user-profile" })).toBe("Get User Profile");
    });
});
