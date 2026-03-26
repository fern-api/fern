import { describe, expect, it, vi } from "vitest";
import { APIErrorLevel, ErrorCollector } from "../ErrorCollector.js";
import { validateDescription, validateOpenApiSpec, validateTagNames } from "../OpenApiSpecValidations.js";

const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
};

function createErrorCollector(): ErrorCollector {
    return new ErrorCollector({
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        logger: mockLogger as any
    });
}

describe("OpenAPI Spec Validations", () => {
    describe("validateTagNames", () => {
        it("should collect an error for tags with emoji characters", () => {
            const errorCollector = createErrorCollector();
            validateTagNames({
                tags: [{ name: "🔐 Authentication" }, { name: "📦 Program Orders" }],
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors).toHaveLength(2);
            expect(errors[0]?.level).toBe(APIErrorLevel.ERROR);
            expect(errors[0]?.message).toContain("🔐 Authentication");
            expect(errors[0]?.message).toContain("non-ASCII characters");
            expect(errors[1]?.message).toContain("📦 Program Orders");
        });

        it("should not collect errors for tags with only ASCII characters", () => {
            const errorCollector = createErrorCollector();
            validateTagNames({
                tags: [{ name: "Authentication" }, { name: "Program Orders" }],
                errorCollector
            });
            expect(errorCollector.getErrors()).toHaveLength(0);
        });

        it("should collect an error for tags with non-emoji unicode characters", () => {
            const errorCollector = createErrorCollector();
            validateTagNames({
                tags: [{ name: "Ünïcödé" }],
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]?.level).toBe(APIErrorLevel.ERROR);
        });

        it("should not collect errors for an empty tags array", () => {
            const errorCollector = createErrorCollector();
            validateTagNames({
                tags: [],
                errorCollector
            });
            expect(errorCollector.getErrors()).toHaveLength(0);
        });

        it("should include a resolution suggesting the cleaned name", () => {
            const errorCollector = createErrorCollector();
            validateTagNames({
                tags: [{ name: "🔐 Authentication" }],
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors[0]?.resolution).toContain("Authentication");
        });

        it("should include the correct path in error", () => {
            const errorCollector = createErrorCollector();
            validateTagNames({
                tags: [{ name: "🔐 Authentication" }],
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors[0]?.path).toEqual(["tags", "🔐 Authentication"]);
        });
    });

    describe("validateDescription", () => {
        it("should collect an error for descriptions with --- frontmatter delimiters", () => {
            const errorCollector = createErrorCollector();
            validateDescription({
                description: "---\n> ⭐ **Start Here** — This is the entry point\n---",
                path: ["paths", "/api/v1/auth/login", "post", "description"],
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]?.level).toBe(APIErrorLevel.ERROR);
            expect(errors[0]?.message).toContain("frontmatter delimiters");
        });

        it("should not collect errors for descriptions without --- delimiters", () => {
            const errorCollector = createErrorCollector();
            validateDescription({
                description: "This is a normal description without any frontmatter.",
                path: ["paths", "/api/v1/auth/login", "post", "description"],
                errorCollector
            });
            expect(errorCollector.getErrors()).toHaveLength(0);
        });

        it("should collect an error when --- appears at the beginning of the description", () => {
            const errorCollector = createErrorCollector();
            validateDescription({
                description: "---\nsome content here\n---",
                path: ["paths", "/example", "get", "description"],
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors).toHaveLength(1);
            expect(errors[0]?.level).toBe(APIErrorLevel.ERROR);
        });

        it("should not collect errors for --- within a sentence (not on its own line)", () => {
            const errorCollector = createErrorCollector();
            validateDescription({
                description: "Use the endpoint --- see documentation for details",
                path: ["paths", "/example", "get", "description"],
                errorCollector
            });
            // The regex requires --- on its own line (with optional whitespace), so this should not match
            // However, our regex matches any --- with a newline boundary or start/end. Let's check.
            // "Use the endpoint --- see documentation for details" - no newlines, so the regex should NOT match
            expect(errorCollector.getErrors()).toHaveLength(0);
        });

        it("should include the correct path in error", () => {
            const errorCollector = createErrorCollector();
            validateDescription({
                description: "---\ncontent\n---",
                path: ["paths", "/api/login", "post", "description"],
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors[0]?.path).toEqual(["paths", "/api/login", "post", "description"]);
        });

        it("should collect an error for --- with surrounding whitespace on its line", () => {
            const errorCollector = createErrorCollector();
            validateDescription({
                description: "  ---  \ncontent\n  ---  ",
                path: ["paths", "/example", "get", "description"],
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors).toHaveLength(1);
        });
    });

    describe("validateOpenApiSpec", () => {
        it("should validate both tags and descriptions in a full spec", () => {
            const errorCollector = createErrorCollector();
            validateOpenApiSpec({
                spec: {
                    tags: [{ name: "🔐 Authentication" }, { name: "Valid Tag" }],
                    paths: {
                        "/api/login": {
                            post: {
                                description: "---\n> Start here\n---",
                                tags: ["🔐 Authentication"]
                            }
                        }
                    }
                },
                errorCollector
            });
            const errors = errorCollector.getErrors();
            // Should have 1 tag error (from top-level tags) + 1 description error
            expect(errors).toHaveLength(2);
            expect(errors.some((e) => e.message.includes("non-ASCII"))).toBe(true);
            expect(errors.some((e) => e.message.includes("frontmatter"))).toBe(true);
        });

        it("should not collect errors for a valid spec", () => {
            const errorCollector = createErrorCollector();
            validateOpenApiSpec({
                spec: {
                    tags: [{ name: "Authentication" }, { name: "Users" }],
                    paths: {
                        "/api/login": {
                            post: {
                                description: "Login to get a JWT token",
                                tags: ["Authentication"]
                            }
                        }
                    }
                },
                errorCollector
            });
            expect(errorCollector.getErrors()).toHaveLength(0);
        });

        it("should validate inline tags when no top-level tags are defined", () => {
            const errorCollector = createErrorCollector();
            validateOpenApiSpec({
                spec: {
                    paths: {
                        "/api/login": {
                            post: {
                                description: "Login endpoint",
                                tags: ["🔐 Authentication"]
                            }
                        },
                        "/api/orders": {
                            get: {
                                description: "Get orders",
                                tags: ["📦 Orders"]
                            }
                        }
                    }
                },
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors).toHaveLength(2);
            expect(errors.every((e) => e.message.includes("non-ASCII"))).toBe(true);
        });

        it("should handle spec with no tags and no paths", () => {
            const errorCollector = createErrorCollector();
            validateOpenApiSpec({
                spec: {},
                errorCollector
            });
            expect(errorCollector.getErrors()).toHaveLength(0);
        });

        it("should handle spec with null path items", () => {
            const errorCollector = createErrorCollector();
            validateOpenApiSpec({
                spec: {
                    paths: {
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                        "/api/login": null as any
                    }
                },
                errorCollector
            });
            expect(errorCollector.getErrors()).toHaveLength(0);
        });

        it("should not duplicate tag errors when same tag appears in multiple operations", () => {
            const errorCollector = createErrorCollector();
            validateOpenApiSpec({
                spec: {
                    paths: {
                        "/api/login": {
                            post: {
                                description: "Login",
                                tags: ["🔐 Auth"]
                            }
                        },
                        "/api/logout": {
                            post: {
                                description: "Logout",
                                tags: ["🔐 Auth"]
                            }
                        }
                    }
                },
                errorCollector
            });
            const tagErrors = errorCollector.getErrors().filter((e) => e.message.includes("non-ASCII"));
            // Should only report the tag error once
            expect(tagErrors).toHaveLength(1);
        });

        it("should validate multiple emoji tags from different operations", () => {
            const errorCollector = createErrorCollector();
            validateOpenApiSpec({
                spec: {
                    tags: [{ name: "🔐 Authentication" }, { name: "📦 Orders" }, { name: "❤️ Health" }]
                },
                errorCollector
            });
            const errors = errorCollector.getErrors();
            expect(errors).toHaveLength(3);
        });
    });
});
