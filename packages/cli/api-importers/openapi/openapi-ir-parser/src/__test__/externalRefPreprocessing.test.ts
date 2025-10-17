import { TaskContext } from "@fern-api/task-context";
import fs from "fs/promises";
import { OpenAPIV3 } from "openapi-types";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
            const result = (
                resolver as ExternalDocumentResolver & {
                    resolveInternalPointer(doc: unknown, pointer: string): unknown;
                }
            ).resolveInternalPointer(document, "#/components/schemas/Pet");

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
            const result = (
                resolver as ExternalDocumentResolver & {
                    resolveInternalPointer(doc: unknown, pointer: string): unknown;
                }
            ).resolveInternalPointer(document, "#/components~1test/schemas~0test/Pet");

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

            // The Pet schema in the document should be a reference now
            expect(allComponents!.Pet).toEqual({ $ref: "#/components/schemas/Pet" });

            // But we should also have the actual components stored
            // Note: In this case since Pet references itself, it might create a new internal name
            // Let's just verify that the components were added
            expect(Object.keys(allComponents!)).toContain("Pet");
            expect(Object.keys(allComponents!)).toContain("Owner");
            expect(Object.keys(allComponents!)).toContain("Address");

            // Let's check the actual resolved components (avoiding the self-reference issue)
            const ownerComponent = allComponents!.Owner;
            const addressComponent = allComponents!.Address;

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

            // Should have logged a warning
            expect(mockTaskContext.logger.warn).toHaveBeenCalled();
        });
    });
});
