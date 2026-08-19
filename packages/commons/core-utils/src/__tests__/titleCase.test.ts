import { titleCase } from "../titleCase.js";

describe("titleCase", () => {
    it("splits camelCase words", () => {
        expect(titleCase("getUserProfile")).toBe("Get User Profile");
    });

    it("splits single uppercase letter followed by a capitalized word", () => {
        expect(titleCase("deleteAUser")).toBe("Delete a User");
    });

    it("handles single uppercase letter 'A' in the middle of camelCase", () => {
        expect(titleCase("getSegmentsForAShopperProfile")).toBe("Get Segments for a Shopper Profile");
    });

    it("splits acronyms from the following word", () => {
        expect(titleCase("HTMLParser")).toBe("HTML Parser");
    });

    it("handles acronym in the middle of camelCase", () => {
        expect(titleCase("getAPIKey")).toBe("Get API Key");
    });

    it("handles snake_case input", () => {
        expect(titleCase("get_user_profile")).toBe("Get User Profile");
    });

    it("handles kebab-case input", () => {
        expect(titleCase("get-user-profile")).toBe("Get User Profile");
    });

    it("handles a single word", () => {
        expect(titleCase("User")).toBe("User");
    });

    it("handles all uppercase acronym", () => {
        expect(titleCase("ID")).toBe("ID");
    });

    it("handles PascalCase input with single letter word", () => {
        expect(titleCase("SegmentsForAShopperProfile")).toBe("Segments for a Shopper Profile");
    });

    it("collapses version strings like V2", () => {
        expect(titleCase("getV2Endpoint")).toBe("Get V2endpoint");
    });

    it("handles 'Asegment' pattern", () => {
        expect(titleCase("shopperProfilesForASegment")).toBe("Shopper Profiles for a Segment");
    });

    it("handles multiple single-letter words", () => {
        expect(titleCase("getAOrBOption")).toBe("Get a or B Option");
    });

    it("handles consecutive acronyms", () => {
        expect(titleCase("parseXMLToJSON")).toBe("Parse XML to JSON");
    });

    it("handles mixed snake_case and camelCase", () => {
        expect(titleCase("get_userProfile")).toBe("Get User Profile");
    });

    it("handles empty string", () => {
        expect(titleCase("")).toBe("");
    });

    it("handles single lowercase letter", () => {
        expect(titleCase("a")).toBe("A");
    });

    it("handles real-world subpackage name: segmentsForAShopperProfile", () => {
        expect(titleCase("segmentsForAShopperProfile")).toBe("Segments for a Shopper Profile");
    });
});
