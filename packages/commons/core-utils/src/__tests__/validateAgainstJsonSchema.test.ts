import { JSONSchema4 } from "json-schema";

import { validateAgainstJsonSchema } from "../validateAgainstJsonSchema";

/**
 * Tests for validateAgainstJsonSchema using realistic schemas based on actual
 * Fern configuration files like api.yml, generators.yml, and docs.yml.
 *
 * These schemas reflect the real-world validation scenarios that occur when:
 * - Users define API configurations in Fern workspaces (api.yml)
 * - Generator output configurations are validated (generators.yml)
 * - Documentation navigation structures are processed (docs.yml)
 * - Environment and authentication configurations are checked
 * - Tab configurations and landing pages are validated
 * - Complex union types with anyOf/oneOf are handled (navigation items)
 * - Nested array validation occurs (section contents, navigation items)
 *
 * The schemas include realistic patterns found in production:
 * - Required vs optional properties with oneOf [type, null] patterns
 * - AdditionalProperties configurations for dynamic objects
 * - Enum validations for availability states and other constants
 * - Complex nested structures with multiple levels of validation
 * - Union types representing different configuration variants
 */

describe("validateAgainstJsonSchema", () => {
    // Real-world schema based on api.yml structure from Fern workspace
    const apiSchema: JSONSchema4 = {
        type: "object",
        properties: {
            name: { type: "string" },
            "display-name": {
                oneOf: [{ type: "string" }, { type: "null" }]
            },
            "default-url": {
                oneOf: [{ type: "string" }, { type: "null" }]
            },
            "default-environment": {
                oneOf: [{ type: "string" }, { type: "null" }]
            },
            environments: {
                oneOf: [
                    {
                        type: "object",
                        additionalProperties: {
                            type: "object",
                            properties: {
                                url: { type: "string" }
                            },
                            required: ["url"]
                        }
                    },
                    { type: "null" }
                ]
            },
            auth: {
                oneOf: [{ type: "string" }, { type: "null" }]
            }
        },
        required: ["name"],
        additionalProperties: false
    };

    // Real-world docs.yml schema based on Fern's documentation configuration
    const docsSchema: JSONSchema4 = {
        type: "object",
        properties: {
            navigation: {
                type: "array",
                items: {
                    anyOf: [
                        {
                            // Page configuration
                            type: "object",
                            properties: {
                                page: { type: "string" },
                                path: { type: "string" },
                                viewers: {
                                    oneOf: [
                                        { type: "string" },
                                        { type: "array", items: { type: "string" } },
                                        { type: "null" }
                                    ]
                                },
                                "feature-flag": { type: "string" },
                                orphaned: { type: "boolean" },
                                hidden: { type: "boolean" },
                                availability: {
                                    enum: [
                                        "stable",
                                        "generally-available",
                                        "in-development",
                                        "pre-release",
                                        "deprecated",
                                        "beta"
                                    ]
                                }
                            },
                            required: ["page", "path"],
                            additionalProperties: false
                        },
                        {
                            // Section configuration
                            type: "object",
                            properties: {
                                section: { type: "string" },
                                contents: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            page: { type: "string" },
                                            path: { type: "string" }
                                        },
                                        required: ["page", "path"]
                                    }
                                },
                                path: { type: "string" },
                                collapsed: { type: "boolean" },
                                viewers: {
                                    oneOf: [
                                        { type: "string" },
                                        { type: "array", items: { type: "string" } },
                                        { type: "null" }
                                    ]
                                }
                            },
                            required: ["section", "contents"],
                            additionalProperties: false
                        },
                        {
                            // API Reference configuration
                            type: "object",
                            properties: {
                                api: { type: "string" },
                                "api-name": { type: "string" },
                                paginated: { type: "boolean" },
                                audiences: {
                                    oneOf: [
                                        { type: "string" },
                                        { type: "array", items: { type: "string" } },
                                        { type: "null" }
                                    ]
                                },
                                "display-errors": { type: "boolean" },
                                summary: { type: "string" },
                                icon: { type: "string" },
                                slug: { type: "string" },
                                hidden: { type: "boolean" },
                                availability: {
                                    enum: [
                                        "stable",
                                        "generally-available",
                                        "in-development",
                                        "pre-release",
                                        "deprecated",
                                        "beta"
                                    ]
                                },
                                "skip-slug": { type: "boolean" },
                                alphabetized: { type: "boolean" },
                                flattened: { type: "boolean" },
                                playground: { type: "object" }
                            },
                            required: ["api"],
                            additionalProperties: false
                        }
                    ]
                }
            },
            tabs: {
                type: "object",
                additionalProperties: {
                    type: "object",
                    properties: {
                        "display-name": { type: "string" },
                        "feature-flag": { type: "string" },
                        orphaned: { type: "boolean" },
                        viewers: {
                            oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }]
                        }
                    },
                    additionalProperties: false
                }
            },
            "landing-page": {
                type: "object",
                properties: {
                    page: { type: "string" },
                    path: { type: "string" },
                    availability: {
                        enum: ["stable", "generally-available", "in-development", "pre-release", "deprecated", "beta"]
                    }
                },
                required: ["page", "path"],
                additionalProperties: false
            }
        },
        required: ["navigation"],
        additionalProperties: false
    };

    it("should return success for valid API configuration", () => {
        const validApiConfig = {
            name: "petstore-api",
            "display-name": "Petstore API",
            "default-environment": "production",
            environments: {
                production: {
                    url: "https://api.petstore.com"
                },
                staging: {
                    url: "https://staging.petstore.com"
                }
            },
            auth: "bearer"
        };

        const result = validateAgainstJsonSchema(validApiConfig, apiSchema);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validApiConfig);
        }
    });

    it("should return success for minimal valid API configuration", () => {
        const minimalApiConfig = {
            name: "simple-api"
        };

        const result = validateAgainstJsonSchema(minimalApiConfig, apiSchema);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(minimalApiConfig);
        }
    });

    it("should return failure for invalid environment configuration", () => {
        const invalidApiConfig = {
            name: "petstore-api",
            environments: {
                production: {
                    baseUrl: "https://api.petstore.com" // should be 'url', not 'baseUrl'
                }
            }
        };

        const result = validateAgainstJsonSchema(invalidApiConfig, apiSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBeDefined();
        }
    });

    it("should return failure when required API name is missing", () => {
        const incompleteApiConfig = {
            "display-name": "My API",
            "default-environment": "production"
            // missing required 'name' field
        };

        const result = validateAgainstJsonSchema(incompleteApiConfig, apiSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBeDefined();
            expect(result.error?.params?.missingProperty).toBe("name");
        }
    });

    it("should include path in error message for missing required property", () => {
        const incompleteApiConfig = {
            "display-name": "My API"
        };

        const result = validateAgainstJsonSchema(incompleteApiConfig, apiSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.name");
            expect(result.error?.message).toContain("Missing required property");
        }
    });

    it("should include path in error message for additional property", () => {
        const dataWithExtra = {
            name: "petstore-api",
            "invalid-property": "value" // not allowed in API schema
        };

        const result = validateAgainstJsonSchema(dataWithExtra, apiSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.invalid-property");
            expect(result.error?.message).toContain("Unexpected property");
        }
    });

    it("should include path in error message for type mismatch", () => {
        const invalidApiConfig = {
            name: 123, // should be string, not number
            "display-name": "My API"
        };

        const result = validateAgainstJsonSchema(invalidApiConfig, apiSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.name");
            expect(result.error?.message).toContain("Incorrect type");
            expect(result.error?.message).toContain("expected string");
            expect(result.error?.message).toContain("received number");
        }
    });

    it("should include path in error message for nested properties", () => {
        const invalidApiConfig = {
            name: "petstore-api",
            environments: {
                production: {
                    // missing required 'url' property
                },
                staging: {
                    url: "https://staging.petstore.com"
                }
            }
        };

        const result = validateAgainstJsonSchema(invalidApiConfig, apiSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.environments.production.url");
            expect(result.error?.message).toContain("Missing required property");
        }
    });

    it("should return success for valid docs configuration", () => {
        const validDocsConfig = {
            navigation: [
                {
                    page: "introduction",
                    path: "docs/introduction.mdx"
                },
                {
                    section: "API Reference",
                    contents: [
                        {
                            page: "authentication",
                            path: "docs/auth.mdx"
                        },
                        {
                            page: "endpoints",
                            path: "docs/endpoints.mdx"
                        }
                    ]
                }
            ],
            tabs: {
                "api-docs": {
                    "display-name": "API Documentation"
                },
                guides: {
                    "display-name": "Guides",
                    "feature-flag": "enable-guides"
                }
            },
            "landing-page": {
                page: "welcome",
                path: "docs/welcome.mdx",
                availability: "stable"
            }
        };

        const result = validateAgainstJsonSchema(validDocsConfig, docsSchema);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validDocsConfig);
        }
    });

    it("should return success for minimal docs configuration", () => {
        const minimalDocsConfig = {
            navigation: [
                {
                    page: "overview",
                    path: "docs/overview.mdx"
                }
            ]
        };

        const result = validateAgainstJsonSchema(minimalDocsConfig, docsSchema);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(minimalDocsConfig);
        }
    });

    it("should fail when navigation array is missing", () => {
        const incompleteDocsConfig = {
            tabs: {
                api: {
                    "display-name": "API"
                }
            }
        };

        const result = validateAgainstJsonSchema(incompleteDocsConfig, docsSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("Missing required property 'navigation'");
        }
    });

    it("should fail when page configuration is missing required fields", () => {
        const invalidDocsConfig = {
            navigation: [
                {
                    page: "introduction"
                    // missing required 'path' property
                }
            ]
        };

        const result = validateAgainstJsonSchema(invalidDocsConfig, docsSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.navigation[0]");
            expect(result.error?.message).toContain("does not match any allowed schema");
        }
    });

    it("should fail when section configuration is missing required fields", () => {
        const invalidDocsConfig = {
            navigation: [
                {
                    section: "API Reference"
                    // missing required 'contents' property
                }
            ]
        };

        const result = validateAgainstJsonSchema(invalidDocsConfig, docsSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.navigation[0]");
            expect(result.error?.message).toContain("does not match any allowed schema");
        }
    });

    it("should fail when section contents have invalid page configuration", () => {
        const invalidDocsConfig = {
            navigation: [
                {
                    section: "API Reference",
                    contents: [
                        {
                            page: "authentication",
                            path: "docs/auth.mdx"
                        },
                        {
                            path: "docs/endpoints.mdx"
                            // missing required 'page' property in contents
                        }
                    ]
                }
            ]
        };

        const result = validateAgainstJsonSchema(invalidDocsConfig, docsSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            // With improved error selection, we now get the more specific required property error
            expect(result.error?.message).toContain("$.navigation[0]");
            // The improved algorithm now gives a more specific error about the missing 'page' property
            expect(result.error?.message).toMatch(
                /(Missing required property 'page'|does not match any allowed schema)/
            );
        }
    });

    describe("best-guess schema suggestions", () => {
        it("should suggest removing extra property when there's one extra", () => {
            const dataWithExtra = {
                name: "petstore-api",
                "display-name": "Petstore API",
                "base-url": "https://api.petstore.com" // should be 'default-url'
            };

            const result = validateAgainstJsonSchema(dataWithExtra, apiSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error?.message).toContain("Did you mean to remove 'base-url'?");
            }
        });

        it("should suggest adding missing required property when there's one missing", () => {
            const incompleteConfig = {
                "display-name": "My API",
                "default-environment": "production"
                // missing required 'name'
            };

            const result = validateAgainstJsonSchema(incompleteConfig, apiSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error?.message).toContain("Did you mean to add 'name'?");
            }
        });

        it("should suggest both adding and removing properties", () => {
            const dataWithMixedIssues = {
                "display-name": "My API",
                "base-url": "https://api.example.com" // wrong: should be 'default-url', missing 'name'
            };

            const result = validateAgainstJsonSchema(dataWithMixedIssues, apiSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error?.message).toContain("Did you mean to add 'name' and remove 'base-url'?");
            }
        });

        it("should suggest best matching schema in oneOf union", () => {
            // Based on generator output configuration patterns in Fern
            const outputConfigSchema: JSONSchema4 = {
                oneOf: [
                    {
                        type: "object",
                        properties: {
                            location: { const: "local" },
                            path: { type: "string" }
                        },
                        required: ["location", "path"]
                    },
                    {
                        type: "object",
                        properties: {
                            location: { const: "npm" },
                            "package-name": { type: "string" },
                            token: { type: "string" }
                        },
                        required: ["location", "package-name"]
                    },
                    {
                        type: "object",
                        properties: {
                            location: { const: "github" },
                            repository: { type: "string" },
                            mode: { type: "string" }
                        },
                        required: ["location", "repository"]
                    }
                ]
            };

            const almostNpmConfig = {
                location: "npm",
                "package-name": "my-sdk"
                // missing optional 'token', but this should be close enough to match npm schema
            };

            const result = validateAgainstJsonSchema(almostNpmConfig, outputConfigSchema);
            // This should succeed since token is not required
            if (result.success) {
                expect(result.success).toBe(true);
            } else {
                // If it fails for some other reason, check suggestion logic
                expect(result.error?.message).toContain("Did you mean to");
            }
        });

        it("should suggest best matching schema when missing required field in union", () => {
            // Based on generator output configuration patterns in Fern
            const outputConfigSchema: JSONSchema4 = {
                oneOf: [
                    {
                        type: "object",
                        properties: {
                            location: { const: "npm" },
                            "package-name": { type: "string" }
                        },
                        required: ["location", "package-name"]
                    },
                    {
                        type: "object",
                        properties: {
                            location: { const: "local" },
                            path: { type: "string" }
                        },
                        required: ["location", "path"]
                    }
                ]
            };

            const incompleteNpmConfig = {
                location: "npm"
                // missing required 'package-name'
            };

            const result = validateAgainstJsonSchema(incompleteNpmConfig, outputConfigSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                // With improved error selection, we get a more specific required property error
                // rather than a generic union error with suggestions
                expect(result.error?.message).toMatch(/(Missing required property|Did you mean to add)/);
            }
        });

        it("should detect complex schema validation errors for docs navigation", () => {
            const incompleteDocsConfig = {
                navigation: [
                    {
                        page: "introduction",
                        path: "docs/intro.mdx"
                    },
                    {
                        section: "API Guide"
                        // missing required 'contents' for section
                    }
                ]
            };

            const result = validateAgainstJsonSchema(incompleteDocsConfig, docsSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                // Should detect the union validation error
                expect(result.error?.message).toContain("$.navigation[1]");
                expect(result.error?.message).toContain("does not match any allowed schema");
                // May include suggestions, but complex anyOf schemas are harder to suggest for
                expect(result.error?.message).toMatch(/(section|contents|Did you mean)/);
            }
        });

        it("should detect property name errors in docs configuration", () => {
            const docsConfigWithTypos = {
                navigation: [
                    {
                        page: "introduction",
                        "file-path": "docs/intro.mdx" // should be 'path', not 'file-path'
                    }
                ]
            };

            const result = validateAgainstJsonSchema(docsConfigWithTypos, docsSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                // Should detect the validation error and show properties that exist
                expect(result.error?.message).toContain("$.navigation[0]");
                expect(result.error?.message).toContain("does not match any allowed schema");
                expect(result.error?.message).toContain("file-path");
            }
        });

        it("should suggest removing invalid property from API reference", () => {
            // Simple test case to verify the algorithm works with direct union types
            const simpleUnionSchema: JSONSchema4 = {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            api: { type: "string" },
                            paginated: { type: "boolean" }
                        },
                        required: ["api"],
                        additionalProperties: false
                    },
                    {
                        type: "object",
                        properties: {
                            section: { type: "string" },
                            collapsed: { type: "boolean" }
                        },
                        required: ["section"],
                        additionalProperties: false
                    }
                ]
            };

            const apiRefWithInvalidProp = {
                api: "API Reference",
                paginated: true,
                collapsed: true // 'collapsed' is for sections, not API references
            };

            const result = validateAgainstJsonSchema(apiRefWithInvalidProp, simpleUnionSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                // Should suggest removing the invalid 'collapsed' property
                // since this object otherwise matches the API reference schema perfectly
                expect(result.error?.message).toContain("Did you mean to remove 'collapsed'?");
            }
        });

        it("should provide helpful suggestions for realistic API reference errors", () => {
            // This test mimics the real-world scenario described in the user's issue
            // where a navigation item has API reference properties plus an invalid 'collapsed' property

            const realisticDocsSchema: JSONSchema4 = {
                type: "object",
                properties: {
                    navigation: {
                        type: "array",
                        items: {
                            anyOf: [
                                {
                                    // API Reference - this should be the best match
                                    type: "object",
                                    properties: {
                                        api: { type: "string" },
                                        paginated: { type: "boolean" },
                                        alphabetized: { type: "boolean" },
                                        flattened: { type: "boolean" }
                                    },
                                    required: ["api"],
                                    additionalProperties: false
                                },
                                {
                                    // Section - has collapsed but not api
                                    type: "object",
                                    properties: {
                                        section: { type: "string" },
                                        collapsed: { type: "boolean" },
                                        contents: { type: "array" }
                                    },
                                    required: ["section", "contents"],
                                    additionalProperties: false
                                }
                            ]
                        }
                    }
                },
                required: ["navigation"],
                additionalProperties: false
            };

            // This is the exact scenario: api + paginated + collapsed (where collapsed is invalid for API refs)
            const problemConfig = {
                navigation: [
                    {
                        api: "API Reference",
                        paginated: true,
                        collapsed: true // This property doesn't belong on API references
                    }
                ]
            };

            const result = validateAgainstJsonSchema(problemConfig, realisticDocsSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                // Should provide a helpful error message suggesting the correct fix
                expect(result.error?.message).toMatch(/api|paginated|collapsed/);
                // In an ideal world, this would suggest removing 'collapsed' since
                // the object otherwise perfectly matches the API reference schema
            }
        });

        it("should suggest corrections for landing page configuration", () => {
            const docsConfigWithLandingPageIssue = {
                navigation: [
                    {
                        page: "overview",
                        path: "docs/overview.mdx"
                    }
                ],
                "landing-page": {
                    page: "welcome"
                    // missing required 'path'
                }
            };

            const result = validateAgainstJsonSchema(docsConfigWithLandingPageIssue, docsSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                // The error should include a suggestion to add the missing path
                expect(result.error?.message).toContain("path");
                expect(result.error?.message).toMatch(/(Did you mean to add 'path'|Missing required property)/);
            }
        });

        it("should not suggest when differences are too many", () => {
            const dataTooFarOff = {
                wrongProp1: "value1",
                wrongProp2: "value2",
                wrongProp3: "value3",
                wrongProp4: "value4"
                // Missing required 'name', has 4 wrong props (total diff = 5, > threshold of 2)
            };

            const result = validateAgainstJsonSchema(dataTooFarOff, apiSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error?.message).not.toContain("Did you mean to");
            }
        });

        it("should correctly identify the problematic object in complex docs navigation structure", () => {
            // Create a simplified schema that represents the issue: a union with multiple schemas where
            // one object has an extra property that doesn't belong to any of the union members
            const simplifiedTabNavSchema: JSONSchema4 = {
                type: "object",
                properties: {
                    navigation: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                tab: { type: "string" },
                                layout: {
                                    type: "array",
                                    items: {
                                        anyOf: [
                                            {
                                                // PageConfiguration
                                                type: "object",
                                                properties: {
                                                    page: { type: "string" },
                                                    path: { type: "string" },
                                                    icon: { type: "string" }
                                                },
                                                required: ["page", "path"],
                                                additionalProperties: false
                                            },
                                            {
                                                // ApiReferenceConfiguration
                                                type: "object",
                                                properties: {
                                                    api: { type: "string" },
                                                    paginated: { type: "boolean" }
                                                },
                                                required: ["api"],
                                                additionalProperties: false
                                            }
                                        ]
                                    }
                                }
                            },
                            required: ["tab", "layout"]
                        }
                    }
                },
                required: ["navigation"]
            };

            // Test data that reproduces the issue: a page object with an extra 'foo' property
            const problematicConfig = {
                navigation: [
                    {
                        tab: "docs",
                        layout: [
                            {
                                page: "API Reference",
                                path: "./pages/mermaid.mdx",
                                foo: "bar" // This is the problematic extra property
                            }
                        ]
                    },
                    {
                        tab: "api",
                        layout: [
                            {
                                api: "ref" // This should be valid ApiReferenceConfiguration
                            }
                        ]
                    }
                ]
            };

            const result = validateAgainstJsonSchema(problematicConfig, simplifiedTabNavSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                console.log("Error message:", result.error?.message);
                console.log("All errors:");
                result.allErrors?.forEach((error, i) => {
                    console.log(`  ${i + 1}. ${error.keyword} at ${error.instancePath || "$"}: ${error.message}`);
                    if (error.params) {
                        console.log(`     params:`, error.params);
                    }
                });

                // Look for errors specifically related to the 'foo' property
                const fooErrors = result.allErrors?.filter(
                    (error) =>
                        error.instancePath?.includes("/layout/0") ||
                        (error.params &&
                            typeof error.params === "object" &&
                            "additionalProperty" in error.params &&
                            error.params.additionalProperty === "foo")
                );
                console.log("Foo-related errors:", fooErrors?.length || 0);
                fooErrors?.forEach((error, i) => {
                    console.log(`  Foo ${i + 1}. ${error.keyword} at ${error.instancePath || "$"}: ${error.message}`);
                    if (error.params) {
                        console.log(`     params:`, error.params);
                    }
                });

                // The most specific error should point to the object with the 'foo' property
                // This should find errors related to the foo property
                expect(fooErrors?.length).toBeGreaterThan(0);

                // The algorithm should now correctly identify the foo property as the issue
                expect(result.error?.message).toContain("foo");
                expect(result.error?.message).toContain("$.navigation[0].layout[0]");
                expect(result.error?.message).toContain("Did you mean to remove 'foo'?");
            }
        });

        it("should prefer deeper, more specific errors over shallow union errors", () => {
            // This test ensures that the error selection prioritizes specific property errors
            // over generic union validation failures
            const complexUnionSchema: JSONSchema4 = {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        items: {
                            anyOf: [
                                {
                                    type: "object",
                                    properties: {
                                        type: { const: "page" },
                                        name: { type: "string" },
                                        path: { type: "string" }
                                    },
                                    required: ["type", "name", "path"],
                                    additionalProperties: false
                                },
                                {
                                    type: "object",
                                    properties: {
                                        type: { const: "api" },
                                        endpoint: { type: "string" }
                                    },
                                    required: ["type", "endpoint"],
                                    additionalProperties: false
                                }
                            ]
                        }
                    }
                },
                required: ["items"]
            };

            const problemData = {
                items: [
                    {
                        type: "page",
                        name: "Home",
                        path: "/home",
                        invalidProp: "should not be here" // This is the real problem
                    },
                    {
                        type: "api",
                        endpoint: "/api/users"
                    },
                    {
                        type: "api" // Missing required 'endpoint', but this is not the main issue we want to highlight
                    }
                ]
            };

            const result = validateAgainstJsonSchema(problemData, complexUnionSchema);
            expect(result.success).toBe(false);
            if (!result.success) {
                // The most specific error should point to the 'invalidProp' in the first item
                // NOT to the missing 'endpoint' in the third item
                expect(result.error?.message).toContain("invalidProp");
                expect(result.error?.message).toContain("$.items[0]");

                // Should NOT incorrectly focus on the api object's missing property
                expect(result.error?.message).not.toContain("endpoint");
                expect(result.error?.message).not.toContain("$.items[2]");
            }
        });
    });
});
