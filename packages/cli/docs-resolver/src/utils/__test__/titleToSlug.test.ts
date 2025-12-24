import { titleToSlug } from "../titleToSlug";

describe("titleToSlug", () => {
    it("should convert simple titles to slugs", () => {
        expect(titleToSlug("Hello World")).toBe("hello-world");
        expect(titleToSlug("Getting Started")).toBe("getting-started");
    });

    it("should handle acronyms without incorrect splitting", () => {
        expect(titleToSlug("SDKs")).toBe("sdks");
        expect(titleToSlug("APIs")).toBe("apis");
        expect(titleToSlug("PDFs")).toBe("pdfs");
        expect(titleToSlug("SDK")).toBe("sdk");
        expect(titleToSlug("API")).toBe("api");
    });

    it("should handle mixed case titles with acronyms", () => {
        expect(titleToSlug("Our SDKs")).toBe("our-sdks");
        expect(titleToSlug("REST APIs")).toBe("rest-apis");
        expect(titleToSlug("Download PDFs")).toBe("download-pdfs");
    });

    it("should handle already lowercase titles", () => {
        expect(titleToSlug("sdks")).toBe("sdks");
        expect(titleToSlug("hello world")).toBe("hello-world");
    });

    it("should handle titles with special characters", () => {
        expect(titleToSlug("Hello & World")).toBe("hello-world");
        expect(titleToSlug("API (v2)")).toBe("api-v-2");
    });

    it("should handle camelCase titles", () => {
        expect(titleToSlug("getUserById")).toBe("getuserbyid");
        expect(titleToSlug("createNewOrder")).toBe("createneworder");
    });
});
