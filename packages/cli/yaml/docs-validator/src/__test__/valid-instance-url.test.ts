import { ValidInstanceUrlRule } from "../rules/valid-instance-url/valid-instance-url";

describe("ValidInstanceUrlRule", () => {
    const rule = ValidInstanceUrlRule.create({} as any);

    describe("valid URLs", () => {
        it("accepts valid production URL", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "mycompany.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });

        it("accepts valid dev URL", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "ferndevtest.docs.dev.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });

        it("accepts URL with https protocol", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "https://mycompany.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });

        it("accepts URL with hyphens in subdomain", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "my-company-name.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });

        it("accepts single character subdomain", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "a.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });

        it("accepts 62 character subdomain", async () => {
            const subdomain = "a".repeat(62);
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: `${subdomain}.docs.buildwithfern.com` }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });
    });

    describe("invalid URLs - subdomain contains dot", () => {
        it("rejects subdomain with dot and provides suggestion", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "my.company.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.severity).toBe("fatal");
            expect(violations[0]?.message).toContain("instances[0].url");
            expect(violations[0]?.message).toContain("contains a '.' character");
            expect(violations[0]?.message).toContain("Suggestion: my-company.docs.buildwithfern.com");
        });

        it("rejects multiple dots in subdomain", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "my.company.name.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.severity).toBe("fatal");
            expect(violations[0]?.message).toContain("contains a '.' character");
        });
    });

    describe("invalid URLs - subdomain too long", () => {
        it("rejects subdomain exceeding 62 characters", async () => {
            const subdomain = "a".repeat(63);
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: `${subdomain}.docs.buildwithfern.com` }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.severity).toBe("fatal");
            expect(violations[0]?.message).toContain("instances[0].url");
            expect(violations[0]?.message).toContain("exceeds the maximum of 62 characters");
        });

        it("rejects very long subdomain", async () => {
            const subdomain = "a".repeat(100);
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: `${subdomain}.docs.buildwithfern.com` }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain("100 characters long");
        });
    });

    describe("invalid URLs - invalid characters", () => {
        it("rejects subdomain with underscore", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "my_company.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.severity).toBe("fatal");
            expect(violations[0]?.message).toContain("contains invalid characters");
        });

        it("rejects subdomain starting with hyphen", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "-mycompany.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain("cannot start or end with a hyphen");
        });

        it("rejects subdomain ending with hyphen", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "mycompany-.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain("cannot start or end with a hyphen");
        });

        it("rejects subdomain with special characters", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "my!company.docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain("contains invalid characters");
        });
    });

    describe("invalid URLs - wrong domain", () => {
        it("rejects URL with wrong domain", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "mycompany.docs.example.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.severity).toBe("fatal");
            expect(violations[0]?.message).toContain(
                "must end with one of: docs.buildwithfern.com, docs.dev.buildwithfern.com"
            );
        });

        it("rejects URL without subdomain", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "docs.buildwithfern.com" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.message).toContain("A subdomain is required");
        });
    });

    describe("invalid URLs - malformed", () => {
        it("rejects completely invalid URL", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "not a valid url" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(1);
            expect(violations[0]?.severity).toBe("fatal");
            expect(violations[0]?.message).toContain("Invalid URL format");
        });

        it("skips empty URL", async () => {
            // Empty URLs are skipped by the validation (instance?.url check)
            const violations = await rule.file(
                {
                    config: {
                        instances: [{ url: "" }]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });
    });

    describe("multiple instances", () => {
        it("validates all instances and reports all violations", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [
                            { url: "valid.docs.buildwithfern.com" },
                            { url: "my.invalid.docs.buildwithfern.com" },
                            { url: "another_invalid.docs.buildwithfern.com" }
                        ]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(2);
            expect(violations[0]?.message).toContain("instances[1].url");
            expect(violations[1]?.message).toContain("instances[2].url");
        });
    });

    describe("edge cases", () => {
        it("handles missing instances array", async () => {
            const violations = await rule.file(
                {
                    config: {}
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });

        it("handles empty instances array", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: []
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });

        it("handles instance without url", async () => {
            const violations = await rule.file(
                {
                    config: {
                        instances: [{}]
                    }
                } as any,
                []
            );
            expect(violations).toHaveLength(0);
        });
    });
});
