// biome-ignore lint/style/noNonNullAssertion: Test file with intentional non-null assertions
// biome-ignore lint/suspicious/noExplicitAny: Test file with intentional any types for mocking
// biome-ignore lint/suspicious/noEmptyBlockStatements: Test file with intentional empty blocks for mocking
import { TaskContext } from "@fern-api/task-context";
import fs from "fs/promises";
import { OpenAPIV3 } from "openapi-types";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AbstractOpenAPIV3ParserContext } from "../openapi/v3/AbstractOpenAPIV3ParserContext";
import { DocumentPreprocessor } from "../openapi/v3/DocumentPreprocessor";
import { ExternalDocumentResolver } from "../openapi/v3/ExternalDocumentResolver";

describe("External Reference Preprocessing", () => {
    const mockTaskContext = {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as TaskContext;

    const tempDir = "/tmp/fern-test";

    beforeEach(async () => {
        // Create temp directory and test files
        try {
            await fs.mkdir(tempDir, { recursive: true });
        } catch (error) {
            // Directory might already exist, ignore error
        }
    });

    afterEach(async () => {
        // Clean up temp files
        try {
            await fs.rm(tempDir, { recursive: true });
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    describe("ExternalDocumentResolver", () => {
        it("should parse external references correctly", () => {
            const resolver = new ExternalDocumentResolver(mockTaskContext.logger);

            const externalRef = "./components.yaml#/components/schemas/Pet";
            const result = resolver.parseReference(externalRef, "/api/openapi.yaml");

            expect(result.documentUrl).toBe("/api/components.yaml");
            expect(result.internalPointer).toBe("#/components/schemas/Pet");
            expect(result.isRemote).toBe(false);
        });

        it("should resolve relative URLs correctly", () => {
            const resolver = new ExternalDocumentResolver(mockTaskContext.logger);

            const externalRef = "../shared/models.yaml#/Pet";
            const result = resolver.parseReference(externalRef, "/api/v1/openapi.yaml");

            expect(result.documentUrl).toBe("/api/shared/models.yaml");
            expect(result.internalPointer).toBe("#/Pet");
            expect(result.isRemote).toBe(false);
        });

        it("should handle HTTP URLs correctly", () => {
            const resolver = new ExternalDocumentResolver(mockTaskContext.logger);

            const externalRef = "https://api.example.com/schemas.yaml#/Pet";
            const result = resolver.parseReference(externalRef);

            expect(result.documentUrl).toBe("https://api.example.com/schemas.yaml");
            expect(result.internalPointer).toBe("#/Pet");
            expect(result.isRemote).toBe(true);
        });

        it("should resolve local file references", async () => {
            const externalSchemaContent = {
                components: {
                    schemas: {
                        Pet: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                                name: { type: "string" }
                            },
                            required: ["id", "name"]
                        }
                    }
                }
            };

            const schemaFilePath = path.join(tempDir, "pet.yaml");
            await fs.writeFile(schemaFilePath, JSON.stringify(externalSchemaContent));

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, {
                baseUrl: tempDir
            });

            const result = await resolver.resolveReference(`${tempDir}/pet.yaml#/components/schemas/Pet`);

            expect(result).toEqual({
                type: "object",
                properties: {
                    id: { type: "integer" },
                    name: { type: "string" }
                },
                required: ["id", "name"]
            });
        });

        it("should handle JSON pointer resolution", () => {
            const document = {
                components: {
                    schemas: {
                        Pet: {
                            type: "object",
                            properties: {
                                name: { type: "string" }
                            }
                        }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger);
            const result = resolver.resolveInternalPointer(document, "#/components/schemas/Pet");

            expect(result).toEqual({
                type: "object",
                properties: {
                    name: { type: "string" }
                }
            });
        });

        it("should handle edge cases in JSON pointer", () => {
            const document = {
                "components/test": {
                    "schemas~test": {
                        Pet: { type: "object" }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger);

            // Test escaped characters in JSON pointer
            const result = resolver.resolveInternalPointer(document, "#/components~1test/schemas~0test/Pet");

            expect(result).toEqual({ type: "object" });
        });
    });

    describe("DocumentPreprocessor", () => {
        it("should collect external references from document", () => {
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {
                    "/pets": {
                        get: {
                            responses: {
                                "200": {
                                    description: "Success",
                                    content: {
                                        "application/json": {
                                            schema: { $ref: "./models.yaml#/Pet" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                components: {
                    schemas: {
                        Owner: { $ref: "./models.yaml#/Owner" },
                        InternalType: {
                            type: "object",
                            properties: {
                                pet: { $ref: "#/components/schemas/Pet" } // internal ref
                            }
                        }
                    }
                }
            };

            const refs = DocumentPreprocessor.collectExternalReferences(document);

            expect(refs).toEqual(["./models.yaml#/Pet", "./models.yaml#/Owner"]);
        });

        it("should detect if document has external references", () => {
            const documentWithExternal: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Pet: { $ref: "./models.yaml#/Pet" }
                    }
                }
            };

            const documentWithoutExternal: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Pet: { $ref: "#/components/schemas/InternalPet" },
                        InternalPet: { type: "object" }
                    }
                }
            };

            expect(DocumentPreprocessor.hasExternalReferences(documentWithExternal)).toBe(true);
            expect(DocumentPreprocessor.hasExternalReferences(documentWithoutExternal)).toBe(false);
        });

        it("should process external references and replace them with internal references", async () => {
            // Create external schema file
            const externalSchemaContent = {
                Pet: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" }
                    },
                    required: ["id", "name"]
                }
            };

            const schemaFilePath = path.join(tempDir, "models.yaml");
            await fs.writeFile(schemaFilePath, JSON.stringify(externalSchemaContent));

            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {
                    "/pets": {
                        get: {
                            responses: {
                                "200": {
                                    description: "Success",
                                    content: {
                                        "application/json": {
                                            schema: { $ref: `${schemaFilePath}#/Pet` }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                components: {
                    schemas: {
                        Owner: { $ref: `${schemaFilePath}#/Pet` } // Reuse same schema
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, {
                baseUrl: tempDir
            });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger, undefined);

            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // Check that external references have been replaced with internal references
            const response = processedDocument.paths["/pets"]?.get?.responses?.["200"];
            const petSchema =
                response && "content" in response ? response.content?.["application/json"]?.schema : undefined;
            expect(petSchema).toEqual({
                $ref: "#/components/schemas/Pet"
            });

            const ownerSchema = processedDocument.components?.schemas?.Owner;
            expect(ownerSchema).toEqual({
                $ref: "#/components/schemas/Pet"
            });

            // Check that the Pet schema was added to components
            const petComponent = processedDocument.components?.schemas?.Pet;
            expect(petComponent).toEqual({
                type: "object",
                properties: {
                    id: { type: "integer" },
                    name: { type: "string" }
                },
                required: ["id", "name"]
            });
        });

        it("should handle nested external references", async () => {
            // Create nested external files
            const petSchemaContent = {
                Pet: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        owner: { $ref: `${tempDir}/owner.yaml#/Owner` } // Reference to another external file
                    }
                }
            };

            const ownerSchemaContent = {
                Owner: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        address: { $ref: `${tempDir}/address.yaml#/Address` } // Another level of nesting
                    }
                }
            };

            const addressSchemaContent = {
                Address: {
                    type: "object",
                    properties: {
                        street: { type: "string" },
                        city: { type: "string" }
                    }
                }
            };

            await fs.writeFile(path.join(tempDir, "pet.yaml"), JSON.stringify(petSchemaContent));
            await fs.writeFile(path.join(tempDir, "owner.yaml"), JSON.stringify(ownerSchemaContent));
            await fs.writeFile(path.join(tempDir, "address.yaml"), JSON.stringify(addressSchemaContent));

            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Pet: { $ref: `${tempDir}/pet.yaml#/Pet` }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, {
                baseUrl: tempDir
            });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger, undefined);

            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // Check that external references have been replaced with internal references
            const petSchemaRef = processedDocument.components?.schemas?.Pet;
            // The Pet component itself should contain the actual content, not be a self-reference
            expect(petSchemaRef).toEqual({
                type: "object",
                properties: {
                    id: { type: "integer" },
                    owner: { $ref: "#/components/schemas/Owner" }
                }
            });

            // Check that all components have been added properly
            const allComponents = processedDocument.components?.schemas;
            expect(allComponents).toBeDefined();

            // The Pet schema in the document should now be resolved (not a reference) since we import all components
            expect(allComponents?.Pet).toEqual({
                type: "object",
                properties: {
                    id: { type: "integer" },
                    owner: { $ref: "#/components/schemas/Owner" }
                }
            });

            // But we should also have the actual components stored
            // Note: In this case since Pet references itself, it might create a new internal name
            // Let's just verify that the components were added
            expect(Object.keys(allComponents ?? {})).toContain("Pet");
            expect(Object.keys(allComponents ?? {})).toContain("Owner");
            expect(Object.keys(allComponents ?? {})).toContain("Address");

            // Let's check the actual resolved components (avoiding the self-reference issue)
            const ownerComponent = allComponents?.Owner;
            const addressComponent = allComponents?.Address;

            // Verify Owner component structure with internal refs
            expect(ownerComponent).toEqual({
                type: "object",
                properties: {
                    name: { type: "string" },
                    address: { $ref: "#/components/schemas/Address" }
                }
            });

            // Verify Address component
            expect(addressComponent).toEqual({
                type: "object",
                properties: {
                    street: { type: "string" },
                    city: { type: "string" }
                }
            });
        });

        it("should handle circular references gracefully", async () => {
            // Create files with circular references
            const petSchemaContent = {
                Pet: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        owner: { $ref: "./owner.yaml#/Owner" }
                    }
                }
            };

            const ownerSchemaContent = {
                Owner: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        pet: { $ref: "./pet.yaml#/Pet" } // Circular reference back to pet
                    }
                }
            };

            await fs.writeFile(path.join(tempDir, "pet.yaml"), JSON.stringify(petSchemaContent));
            await fs.writeFile(path.join(tempDir, "owner.yaml"), JSON.stringify(ownerSchemaContent));

            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Pet: { $ref: "./pet.yaml#/Pet" }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, {
                baseUrl: tempDir
            });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger, undefined);

            // Should not throw an error, but handle circular reference gracefully
            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // The document should still be processed, but circular references left as-is
            expect(processedDocument).toBeDefined();
            expect(processedDocument.components?.schemas?.Pet).toBeDefined();
        });

        it("should handle missing external files gracefully", async () => {
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Pet: { $ref: "./nonexistent.yaml#/Pet" }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, {
                baseUrl: tempDir
            });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger, undefined);

            // Should not throw an error
            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // The original reference should be preserved
            expect(processedDocument.components?.schemas?.Pet).toEqual({ $ref: "./nonexistent.yaml#/Pet" });

            // Should have logged a debug message
            expect(mockTaskContext.logger.debug).toHaveBeenCalled();
        });

        it("should handle nested external references with internal dependencies", async () => {
            // Create doc2 with schema C
            const doc2Content = {
                openapi: "3.0.0",
                info: { title: "Doc2", version: "1.0.0" },
                components: {
                    schemas: {
                        SchemaC: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                value: { type: "number" }
                            }
                        }
                    }
                }
            };

            const doc2Path = path.join(tempDir, "doc2.yaml");
            await fs.writeFile(doc2Path, JSON.stringify(doc2Content));

            // Create doc1 with schema B that:
            const doc1Content = {
                openapi: "3.0.0",
                info: { title: "Doc1", version: "1.0.0" },
                components: {
                    schemas: {
                        SchemaB: {
                            type: "object",
                            properties: {
                                internal: { $ref: "#/components/schemas/InternalComponent" },
                                external: { $ref: `${doc2Path}#/components/schemas/SchemaC` }
                            }
                        },
                        InternalComponent: {
                            type: "object",
                            properties: {
                                name: { type: "string" }
                            }
                        }
                    }
                }
            };

            const doc1Path = path.join(tempDir, "doc1.yaml");
            await fs.writeFile(doc1Path, JSON.stringify(doc1Content));

            // Create main schema A that has an external ref to schema B in doc1
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Main API", version: "1.0.0" },
                paths: {
                    "/test": {
                        get: {
                            responses: {
                                "200": {
                                    description: "Success",
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: {
                                                    data: { $ref: `${doc1Path}#/components/schemas/SchemaB` }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                components: {}
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, {
                baseUrl: tempDir
            });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger, undefined);

            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // All schemas should be imported and available
            expect(processedDocument.components?.schemas?.SchemaB).toBeDefined();
            expect(processedDocument.components?.schemas?.InternalComponent).toBeDefined();
            expect(processedDocument.components?.schemas?.SchemaC).toBeDefined();

            expect(processedDocument.components?.schemas?.SchemaB).toEqual({
                type: "object",
                properties: {
                    internal: { $ref: "#/components/schemas/InternalComponent" },
                    external: { $ref: "#/components/schemas/SchemaC" }
                }
            });

            // The main document's reference should be converted to internal
            const response = processedDocument.paths["/test"]?.get?.responses?.["200"];
            const schema =
                response && "content" in response ? response.content?.["application/json"]?.schema : undefined;
            expect(schema).toEqual({
                type: "object",
                properties: {
                    data: { $ref: "#/components/schemas/SchemaB" }
                }
            });
        });
    });

    describe("Domain Reference Dependencies", () => {
        it("should import all components for SwaggerHub domain references to resolve dependencies", async () => {
            // Create a mock SwaggerHub Collections domain with PagingCursors referencing PagingCursorUrl
            const collectionsSchema = {
                openapi: "3.0.0",
                info: { title: "Collections", version: "1.0" },
                components: {
                    schemas: {
                        PagingCursors: {
                            type: "object",
                            properties: {
                                next: { $ref: "#/components/schemas/PagingCursorUrl" },
                                previous: { $ref: "#/components/schemas/PagingCursorUrl" }
                            }
                        },
                        PagingCursorUrl: {
                            type: "object",
                            properties: {
                                url: { type: "string" },
                                cursor: { type: "string" }
                            }
                        },
                        Limit: { type: "integer" },
                        Cursor: { type: "string" }
                    }
                }
            };

            const collectionsPath = path.join(tempDir, "collections-domain.yml");
            await fs.writeFile(collectionsPath, JSON.stringify(collectionsSchema));

            // Create a main document that references only PagingCursors from the domain
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test", version: "1.0" },
                paths: {
                    "/test": {
                        get: {
                            responses: {
                                "200": {
                                    description: "Success",
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: {
                                                    paging: {
                                                        $ref: `${collectionsPath}#/components/schemas/PagingCursors`
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, {
                baseUrl: tempDir
            });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger, undefined);

            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // Should have imported all components from the domain, not just PagingCursors
            expect(processedDocument.components?.schemas?.PagingCursors).toBeDefined();
            expect(processedDocument.components?.schemas?.PagingCursorUrl).toBeDefined(); // This is the key dependency
            expect(processedDocument.components?.schemas?.Limit).toBeDefined();
            expect(processedDocument.components?.schemas?.Cursor).toBeDefined();

            // The reference should be converted to internal
            expect(processedDocument.paths["/test"]?.get?.responses?.["200"]).toBeDefined();
            // biome-ignore lint/suspicious/noExplicitAny: Test file type assertion
            const responseSchema = (processedDocument.paths["/test"]?.get?.responses?.["200"] as any)?.content?.[
                "application/json"
            ]?.schema;
            expect(responseSchema?.properties?.paging?.$ref).toBe("#/components/schemas/PagingCursors");
        });

        it("should import all components for domain references with dependencies", async () => {
            // Create a domain schema with interdependent components (like SwaggerHub Collections)
            const domainSchema = {
                openapi: "3.0.0",
                info: { title: "Test Domain", version: "1.0" },
                components: {
                    schemas: {
                        PagingCursors: {
                            type: "object",
                            properties: {
                                next: { $ref: "#/components/schemas/PagingCursorUrl" },
                                previous: { $ref: "#/components/schemas/PagingCursorUrl" }
                            }
                        },
                        PagingCursorUrl: {
                            type: "object",
                            properties: {
                                url: { type: "string" },
                                cursor: { type: "string" }
                            }
                        },
                        Limit: { type: "integer" },
                        UnusedSchema: { type: "string" }
                    }
                }
            };

            const domainPath = path.join(tempDir, "test-domain.yml");
            await fs.writeFile(domainPath, JSON.stringify(domainSchema));

            // Document that only references PagingCursors (but needs PagingCursorUrl dependency)
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0" },
                paths: {},
                components: {
                    schemas: {
                        ApiResponse: { $ref: `${domainPath}#/components/schemas/PagingCursors` }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, { baseUrl: tempDir });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger);

            // biome-ignore lint/suspicious/noExplicitAny: Test mock
            // Mock isDomainReference to treat our test file as a domain
            (preprocessor as any).isDomainReference = (url: string) => url.includes("test-domain.yml");

            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // When treated as domain, should import ALL components from domain, including dependencies
            expect(processedDocument.components?.schemas?.PagingCursors).toBeDefined();
            expect(processedDocument.components?.schemas?.PagingCursorUrl).toBeDefined(); // Critical dependency
            expect(processedDocument.components?.schemas?.Limit).toBeDefined();
            expect(processedDocument.components?.schemas?.UnusedSchema).toBeDefined(); // Even unused ones

            // ApiResponse should now be an internal reference (external reference converted)
            expect(processedDocument.components?.schemas?.ApiResponse).toBeDefined();
            expect(processedDocument.components?.schemas?.ApiResponse).toEqual({
                $ref: "#/components/schemas/PagingCursors"
            });

            // The actual PagingCursors schema should be available and have the correct structure
            expect(processedDocument.components?.schemas?.PagingCursors).toEqual({
                type: "object",
                properties: {
                    next: { $ref: "#/components/schemas/PagingCursorUrl" },
                    previous: { $ref: "#/components/schemas/PagingCursorUrl" }
                }
            });
        });
    });

    describe("Circular Reference Protection", () => {
        it("should handle circular references in security schemes without stack overflow", async () => {
            // Create a security domain document (similar to enterprise security libraries)
            const securityDomainSchema = {
                openapi: "3.0.0",
                info: {
                    title: "Enterprise Security Domain",
                    description: "Common components and schemas used for securing APIs.",
                    version: "1.0"
                },
                components: {
                    securitySchemes: {
                        BearerAuth: {
                            type: "http",
                            scheme: "bearer",
                            description:
                                "Bearer authentication specifies a bearer token in the 'Authorization' header following the format: Authorization: Bearer <token>"
                        },
                        CircularRef: {
                            // This creates a circular reference to itself
                            $ref: "#/components/securitySchemes/CircularRef"
                        }
                    }
                }
            };

            const securityDomainPath = path.join(tempDir, "security-domain.yml");
            await fs.writeFile(securityDomainPath, JSON.stringify(securityDomainSchema));

            // Main document that references the security domain
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0" },
                paths: {},
                components: {
                    securitySchemes: {
                        BearerAuth: {
                            $ref: `${securityDomainPath}#/components/securitySchemes/BearerAuth`
                        },
                        CircularTest: {
                            $ref: `${securityDomainPath}#/components/securitySchemes/CircularRef`
                        }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, { baseUrl: tempDir });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger);

            // This should not cause a stack overflow
            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // Should have imported all security schemes from the domain
            expect(processedDocument.components?.securitySchemes?.BearerAuth).toBeDefined();
            expect(processedDocument.components?.securitySchemes?.CircularRef).toBeDefined();

            // The main document's references should be replaced with actual content from the domain
            expect(processedDocument.components?.securitySchemes?.BearerAuth).toEqual({
                type: "http",
                scheme: "bearer",
                description:
                    "Bearer authentication specifies a bearer token in the 'Authorization' header following the format: Authorization: Bearer <token>"
            });

            // The circular reference should be handled gracefully (imported as-is with the circular reference)
            expect(processedDocument.components?.securitySchemes?.CircularRef).toEqual({
                $ref: "#/components/securitySchemes/CircularRef"
            });

            // Test that circular reference resolution doesn't cause stack overflow
            const context = new (class extends AbstractOpenAPIV3ParserContext {
                markSchemaAsReferencedByNonRequest() {}
                markSchemaAsReferencedByRequest() {}
                getReferencedSchemas() {
                    return new Set<string>();
                }
                getDummy() {
                    return this;
                }
                markReferencedByDiscriminatedUnion() {}
                markSchemaWithDiscriminantValue() {}
                getDiscriminatedUnionMetadata() {
                    return undefined;
                }
                getReferencesFromDiscriminatedUnion() {
                    return undefined;
                }
                excludeSchema() {}
                isSchemaExcluded() {
                    return false;
                }
            })({
                document: processedDocument,
                taskContext: mockTaskContext,
                authHeaders: new Set(),
                options: {
                    disableExamples: false,
                    discriminatedUnionV2: false,
                    useTitlesAsName: false,
                    audiences: [],
                    convertToSnakeCase: false,
                    skipValidation: false,
                    // biome-ignore lint/suspicious/noExplicitAny: Test mock
                    asyncApiNaming: undefined,
                    omitUndefinedProperties: false
                } as any,
                source: {
                    // biome-ignore lint/suspicious/noExplicitAny: Test mock
                    type: "openapi",
                    file: "test.yml",
                    _visit: () => {}
                } as any,
                namespace: undefined
            });

            // This should not cause a stack overflow - it should detect the circular reference and return a fallback
            expect(() => {
                context.resolveSecuritySchemeReference({ $ref: "#/components/securitySchemes/CircularRef" });
            }).not.toThrow();
        });

        it("should handle circular references in schemas without stack overflow", async () => {
            // Create a document with circular schema references
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0" },
                paths: {},
                components: {
                    schemas: {
                        NodeA: {
                            type: "object",
                            properties: {
                                nodeB: { $ref: "#/components/schemas/NodeB" }
                            }
                        },
                        NodeB: {
                            type: "object",
                            properties: {
                                nodeA: { $ref: "#/components/schemas/NodeA" }
                            }
                        }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, { baseUrl: tempDir });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger);

            // This should not cause any issues since there are no external references
            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // Test that circular schema resolution doesn't cause stack overflow
            const context = new (class extends AbstractOpenAPIV3ParserContext {
                markSchemaAsReferencedByNonRequest() {}
                markSchemaAsReferencedByRequest() {}
                getReferencedSchemas() {
                    return new Set<string>();
                }
                getDummy() {
                    return this;
                }
                markReferencedByDiscriminatedUnion() {}
                markSchemaWithDiscriminantValue() {}
                getDiscriminatedUnionMetadata() {
                    return undefined;
                }
                getReferencesFromDiscriminatedUnion() {
                    return undefined;
                }
                excludeSchema() {}
                isSchemaExcluded() {
                    return false;
                }
            })({
                document: processedDocument,
                taskContext: mockTaskContext,
                authHeaders: new Set(),
                options: {
                    disableExamples: false,
                    discriminatedUnionV2: false,
                    useTitlesAsName: false,
                    audiences: [],
                    convertToSnakeCase: false,
                    skipValidation: false,
                    asyncApiNaming: undefined,
                    omitUndefinedProperties: false
                } as any,
                source: {
                    type: "openapi",
                    file: "test.yml",
                    _visit: () => {}
                } as any,
                namespace: undefined
            });

            // This should not cause a stack overflow - it should detect the circular reference and return a fallback
            expect(() => {
                context.resolveSchemaReference({ $ref: "#/components/schemas/NodeA" });
            }).not.toThrow();
        });

        it("should handle shared domain reference conflicts without creating true circular references", async () => {
            // Create a mock shared global domain document (like enterprise shared component libraries)
            const globalDomainSchema = {
                openapi: "3.0.0",
                info: {
                    title: "Global Shared Domain",
                    description: "Common components and schemas used across enterprise APIs.",
                    version: "1.0"
                },
                components: {
                    parameters: {
                        IdempotencyKey: {
                            name: "X-Idempotency-Key",
                            in: "header",
                            required: false,
                            schema: {
                                $ref: "#/components/schemas/IdempotencyKey"
                            }
                        },
                        ServiceName: {
                            name: "X-Service-Name",
                            in: "header",
                            required: true,
                            schema: { type: "string" }
                        }
                    },
                    schemas: {
                        IdempotencyKey: {
                            type: "string",
                            pattern: "^[a-zA-Z0-9_-]{1,255}$",
                            description: "A unique key for idempotent operations"
                        }
                    }
                }
            };

            const globalDomainPath = path.join(tempDir, "global-shared-domain.yml");
            await fs.writeFile(globalDomainPath, JSON.stringify(globalDomainSchema));

            // Create a main document that mimics a service referencing shared components
            const document: OpenAPIV3.Document = {
                openapi: "3.0.1",
                info: { title: "storage-service", version: "1.0.0" },
                paths: {
                    "/v1/resources": {
                        post: {
                            operationId: "createResource",
                            parameters: [{ $ref: `${globalDomainPath}#/components/parameters/IdempotencyKey` }],
                            responses: {
                                "201": { description: "Created" }
                            }
                        }
                    }
                },
                components: {
                    parameters: {
                        IdempotencyKey: {
                            $ref: `${globalDomainPath}#/components/parameters/IdempotencyKey`
                        }
                    },
                    schemas: {
                        CreateRequest: {
                            type: "object",
                            properties: {
                                idempotencyKey: {
                                    $ref: "#/components/schemas/IdempotencyKey" // This will reference the imported schema
                                }
                            }
                        },
                        IdempotencyKey: {
                            $ref: `${globalDomainPath}#/components/schemas/IdempotencyKey`
                        }
                    }
                }
            };

            const resolver = new ExternalDocumentResolver(mockTaskContext.logger, { baseUrl: tempDir });
            const preprocessor = new DocumentPreprocessor(resolver, mockTaskContext.logger);

            // This should not cause a stack overflow - domain reference processing should handle the conflict
            const processedDocument = await preprocessor.processDocument(document, tempDir);

            // Should have imported all components from the shared global domain
            expect(processedDocument.components?.parameters?.IdempotencyKey).toBeDefined();
            expect(processedDocument.components?.parameters?.ServiceName).toBeDefined(); // Also imported from domain
            expect(processedDocument.components?.schemas?.IdempotencyKey).toBeDefined();

            // The external references should be replaced with actual content from the domain
            expect(processedDocument.components?.parameters?.IdempotencyKey).toEqual({
                name: "X-Idempotency-Key",
                in: "header",
                required: false,
                schema: {
                    $ref: "#/components/schemas/IdempotencyKey"
                }
            });
            expect(processedDocument.components?.schemas?.IdempotencyKey).toEqual({
                type: "string",
                pattern: "^[a-zA-Z0-9_-]{1,255}$",
                description: "A unique key for idempotent operations"
            });

            // Test that the actual imported parameter/schema definitions are available
            // Since we import all components, the shared domain's IdempotencyKey should overwrite the local reference
            // This means the final schema should be the actual shared domain definition, not a circular reference
            const context = new (class extends AbstractOpenAPIV3ParserContext {
                markSchemaAsReferencedByNonRequest() {}
                markSchemaAsReferencedByRequest() {}
                getReferencedSchemas() {
                    return new Set<string>();
                }
                getDummy() {
                    return this;
                }
                markReferencedByDiscriminatedUnion() {}
                markSchemaWithDiscriminantValue() {}
                getDiscriminatedUnionMetadata() {
                    return undefined;
                }
                getReferencesFromDiscriminatedUnion() {
                    return undefined;
                }
                excludeSchema() {}
                isSchemaExcluded() {
                    return false;
                }
            })({
                document: processedDocument,
                taskContext: mockTaskContext,
                authHeaders: new Set(),
                options: {
                    disableExamples: false,
                    discriminatedUnionV2: false,
                    useTitlesAsName: false,
                    audiences: [],
                    convertToSnakeCase: false,
                    skipValidation: false,
                    asyncApiNaming: undefined,
                    omitUndefinedProperties: false
                } as any,
                source: {
                    type: "openapi",
                    file: "test.yml",
                    _visit: () => {}
                } as any,
                namespace: undefined
            });

            // This should NOT cause a stack overflow and should resolve successfully
            // The resolved schema should be the actual shared domain schema, not a circular reference
            expect(() => {
                const resolved = context.resolveSchemaReference({ $ref: "#/components/schemas/IdempotencyKey" });
                // Should resolve to the actual schema from shared domain, not be circular
                expect(resolved).toEqual({
                    type: "string",
                    pattern: "^[a-zA-Z0-9_-]{1,255}$",
                    description: "A unique key for idempotent operations"
                });
            }).not.toThrow();
        });
    });
});
