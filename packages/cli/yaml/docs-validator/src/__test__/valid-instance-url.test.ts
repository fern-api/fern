import { validateInstanceUrl } from "../rules/valid-instance-url/valid-instance-url.js";

describe("validateInstanceUrl", () => {
    describe("valid URLs", () => {
        it("accepts valid production URL", () => {
            expect(validateInstanceUrl("mycompany.docs.buildwithfern.com")).toBeNull();
        });

        it("accepts valid dev URL", () => {
            expect(validateInstanceUrl("ferndevtest.docs.dev.buildwithfern.com")).toBeNull();
        });

        it("accepts URL with https protocol", () => {
            expect(validateInstanceUrl("https://mycompany.docs.buildwithfern.com")).toBeNull();
        });

        it("accepts URL with hyphens in subdomain", () => {
            expect(validateInstanceUrl("my-company-name.docs.buildwithfern.com")).toBeNull();
        });

        it("accepts single character subdomain", () => {
            expect(validateInstanceUrl("a.docs.buildwithfern.com")).toBeNull();
        });

        it("accepts 62 character subdomain", () => {
            const subdomain = "a".repeat(62);
            expect(validateInstanceUrl(`${subdomain}.docs.buildwithfern.com`)).toBeNull();
        });

        it("accepts subdomain of buildwithfern.dev", () => {
            expect(validateInstanceUrl("adi-tests-new-pipeline.buildwithfern.dev")).toBeNull();
            expect(validateInstanceUrl("https://mycompany.buildwithfern.dev")).toBeNull();
        });

        it("accepts subdomain of fernapi.dev", () => {
            expect(validateInstanceUrl("mycompany.fernapi.dev")).toBeNull();
        });

        it("accepts subdomain of ferndocs.com", () => {
            expect(validateInstanceUrl("mycompany.ferndocs.com")).toBeNull();
        });

        it("accepts subdomain of ferndocs.dev", () => {
            expect(validateInstanceUrl("mycompany.ferndocs.dev")).toBeNull();
        });

        it("accepts subdomain of fernmcp.dev", () => {
            expect(validateInstanceUrl("mycompany.fernmcp.dev")).toBeNull();
        });
    });

    describe("invalid URLs - subdomain contains dot", () => {
        it("rejects subdomain with dot and provides suggestion", () => {
            const violation = validateInstanceUrl("my.company.docs.buildwithfern.com");
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe("fatal");
            expect(violation?.message).toContain("contains a '.' character");
            expect(violation?.message).toContain("Suggestion: my-company.docs.buildwithfern.com");
        });

        it("rejects multiple dots in subdomain", () => {
            const violation = validateInstanceUrl("my.company.name.docs.buildwithfern.com");
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe("fatal");
            expect(violation?.message).toContain("contains a '.' character");
        });
    });

    describe("invalid URLs - subdomain too long", () => {
        it("rejects subdomain exceeding 62 characters", () => {
            const subdomain = "a".repeat(63);
            const violation = validateInstanceUrl(`${subdomain}.docs.buildwithfern.com`);
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe("fatal");
            expect(violation?.message).toContain("exceeds the maximum of 62 characters");
        });

        it("rejects very long subdomain", () => {
            const subdomain = "a".repeat(100);
            const violation = validateInstanceUrl(`${subdomain}.docs.buildwithfern.com`);
            expect(violation).not.toBeNull();
            expect(violation?.message).toContain("100 characters long");
        });
    });

    describe("invalid URLs - invalid characters", () => {
        it("rejects subdomain with underscore", () => {
            const violation = validateInstanceUrl("my_company.docs.buildwithfern.com");
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe("fatal");
            expect(violation?.message).toContain("contains invalid characters");
        });

        it("rejects subdomain starting with hyphen", () => {
            const violation = validateInstanceUrl("-mycompany.docs.buildwithfern.com");
            expect(violation).not.toBeNull();
            expect(violation?.message).toContain("cannot start or end with a hyphen");
        });

        it("rejects subdomain ending with hyphen", () => {
            const violation = validateInstanceUrl("mycompany-.docs.buildwithfern.com");
            expect(violation).not.toBeNull();
            expect(violation?.message).toContain("cannot start or end with a hyphen");
        });

        it("rejects subdomain with special characters", () => {
            const violation = validateInstanceUrl("my!company.docs.buildwithfern.com");
            expect(violation).not.toBeNull();
            expect(violation?.message).toContain("contains invalid characters");
        });
    });

    describe("invalid URLs - wrong domain", () => {
        it("rejects URL with wrong domain", () => {
            const violation = validateInstanceUrl("mycompany.docs.example.com");
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe("fatal");
            expect(violation?.message).toContain(
                "must end with one of: docs.buildwithfern.com, docs.dev.buildwithfern.com, buildwithfern.dev, fernapi.dev, ferndocs.com, ferndocs.dev, fernmcp.dev"
            );
        });

        it("rejects unrelated domains", () => {
            for (const url of [
                "mycompany.example.com",
                "mycompany.buildwithfern.com",
                "mycompany.fernmcp.com",
                "mycompany.fernapi.com"
            ]) {
                expect(validateInstanceUrl(url)?.message).toContain("must end with one of");
            }
        });

        it("rejects lookalike domains", () => {
            for (const url of [
                "mycompany.notbuildwithfern.dev",
                "mycompany.buildwithfern.dev.evil.com",
                "mycompany.ferndocs.com.evil.com",
                "notferndocs.com",
                "myferndocs.dev"
            ]) {
                expect(validateInstanceUrl(url)?.message).toContain("must end with one of");
            }
        });

        it("rejects URL without subdomain", () => {
            for (const url of [
                "docs.buildwithfern.com",
                "buildwithfern.dev",
                "fernapi.dev",
                "ferndocs.com",
                "ferndocs.dev",
                "fernmcp.dev"
            ]) {
                const violation = validateInstanceUrl(url);
                expect(violation).not.toBeNull();
                expect(violation?.message).toContain("A subdomain is required");
            }
        });
    });

    describe("invalid URLs - malformed", () => {
        it("rejects completely invalid URL", () => {
            const violation = validateInstanceUrl("not a valid url");
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe("fatal");
            expect(violation?.message).toContain("Invalid URL format");
        });
    });
});
