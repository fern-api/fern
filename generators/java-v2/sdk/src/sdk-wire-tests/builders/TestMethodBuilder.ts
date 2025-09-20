import { java } from "@fern-api/java-ast";
import { Writer } from "@fern-api/java-ast/src/ast";
import { HttpEndpoint, TypeReference, ResponseProperty } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { SnippetExtractor } from "../extractors/SnippetExtractor";
import { WireTestExample } from "../extractors/TestDataExtractor";
import { HeaderValidator } from "../validators/HeaderValidator";
import { JsonValidator } from "../validators/JsonValidator";
import { PaginationValidator } from "../validators/PaginationValidator";

/**
 * Builder for generating individual test methods in wire tests.
 */
export class TestMethodBuilder {
    private readonly headerValidator: HeaderValidator;
    private readonly jsonValidator: JsonValidator;
    private readonly paginationValidator: PaginationValidator;
    private readonly snippetExtractor: SnippetExtractor;

    constructor(private readonly context: SdkGeneratorContext) {
        this.headerValidator = new HeaderValidator();
        this.jsonValidator = new JsonValidator(context);
        this.paginationValidator = new PaginationValidator(context);
        this.snippetExtractor = new SnippetExtractor(context);
    }

    /**
     * Creates a test method for an endpoint with mock setup and validation.
     */
    public createTestMethod(
        endpoint: HttpEndpoint,
        snippet: string,
        testExample: WireTestExample
    ): (writer: Writer) => void {
        return (writer) => {
            const testMethodName = `test${this.toJavaMethodName(endpoint.name.pascalCase.safeName)}`;
            const methodCall = this.snippetExtractor.extractMethodCall(snippet);

            writer.writeLine("@Test");
            writer.writeLine(`public void ${testMethodName}() throws Exception {`);
            writer.indent();

            const expectedRequestJson = testExample.request.body;
            const expectedResponseJson = testExample.response.body;
            const responseStatusCode = testExample.response.statusCode;

            const mockResponseBody = expectedResponseJson
                ? JSON.stringify(expectedResponseJson)
                : this.generateMockResponseForEndpoint(endpoint);

            writer.writeLine("server.enqueue(new MockResponse()");
            writer.indent();
            writer.writeLine(`.setResponseCode(${responseStatusCode})`);
            writer.writeLine(`.setBody(${JSON.stringify(mockResponseBody)}));`);
            writer.dedent();

            const hasResponseBody = endpoint.response?.body != null;
            if (hasResponseBody) {
                const returnType = this.getEndpointReturnType(endpoint);
                writer.writeLine(
                    `${returnType} response = ${methodCall.endsWith(";") ? methodCall.slice(0, -1) : methodCall};`
                );
            } else {
                writer.writeLine(methodCall.endsWith(";") ? methodCall : `${methodCall};`);
            }

            writer.writeLine("RecordedRequest request = server.takeRequest();");
            writer.writeLine("Assertions.assertNotNull(request);");
            writer.writeLine(`Assertions.assertEquals("${endpoint.method}", request.getMethod());`);

            this.headerValidator.generateHeaderValidation(writer, testExample);

            if (expectedRequestJson !== undefined && expectedRequestJson !== null) {
                writer.writeLine("// Validate request body");
                writer.writeLine("String actualRequestBody = request.getBody().readUtf8();");

                this.jsonValidator.formatMultilineJson(writer, "expectedRequestBody", expectedRequestJson);

                writer.writeLine("JsonNode actualJson = objectMapper.readTree(actualRequestBody);");
                writer.writeLine("JsonNode expectedJson = objectMapper.readTree(expectedRequestBody);");

                this.jsonValidator.generateEnhancedJsonValidation(
                    writer,
                    endpoint,
                    "request",
                    "actualJson",
                    "expectedJson"
                );
            }

            if (hasResponseBody && expectedResponseJson && responseStatusCode < 400) {
                writer.writeLine("");
                writer.writeLine("// Validate response body");
                writer.writeLine('Assertions.assertNotNull(response, "Response should not be null");');

                writer.writeLine("String actualResponseJson = objectMapper.writeValueAsString(response);");

                this.jsonValidator.formatMultilineJson(writer, "expectedResponseBody", expectedResponseJson);

                writer.writeLine("JsonNode actualResponseNode = objectMapper.readTree(actualResponseJson);");
                writer.writeLine("JsonNode expectedResponseNode = objectMapper.readTree(expectedResponseBody);");

                this.jsonValidator.generateEnhancedJsonValidation(
                    writer,
                    endpoint,
                    "response",
                    "actualResponseNode",
                    "expectedResponseNode"
                );
            } else if (hasResponseBody) {
                writer.writeLine("");
                writer.writeLine("// Validate response deserialization");
                writer.writeLine('Assertions.assertNotNull(response, "Response should not be null");');
                writer.writeLine("// Verify the response can be serialized back to JSON");
                writer.writeLine("String responseJson = objectMapper.writeValueAsString(response);");
                writer.writeLine("Assertions.assertNotNull(responseJson);");
                writer.writeLine("Assertions.assertFalse(responseJson.isEmpty());");
            }

            writer.dedent();
            writer.writeLine("}");
        };
    }

    /**
     * Converts a name to a valid Java method name.
     */
    private toJavaMethodName(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     * Generates a mock response body for endpoints without example data.
     */
    private generateMockResponseForEndpoint(endpoint: HttpEndpoint): string {
        const responseBody = endpoint.response?.body;

        if (!responseBody || responseBody.type !== "json") {
            return "{}";
        }

        return JSON.stringify({
            id: "test-id",
            name: "test-name",
            value: "test-value",
            success: true,
            data: {}
        });
    }

    /**
     * Gets the return type for an endpoint.
     */
    private getEndpointReturnType(endpoint: HttpEndpoint): string {
        try {
            // Check if endpoint has pagination - if so, return SyncPagingIterable<T>
            if (endpoint.pagination != null) {
                const itemType = this.extractPaginationItemType(endpoint);
                if (itemType) {
                    // Use a temporary writer to get the item type name
                    const tempWriter = new java.Writer({
                        packageName: this.context.getCorePackageName(),
                        customConfig: this.context.customConfig
                    });

                    // Write the item type to get its string representation
                    itemType.write(tempWriter);

                    // Get the type name without package prefix
                    const itemTypeName = tempWriter.buffer.trim();

                    return `SyncPagingIterable<${itemTypeName}>`;
                }
            }

            const javaType = this.context.getReturnTypeForEndpoint(endpoint);

            const simpleWriter = new java.Writer({
                packageName: this.context.getCorePackageName(),
                customConfig: this.context.customConfig
            });

            javaType.write(simpleWriter);

            const typeName = simpleWriter.buffer.trim();

            if (typeName === "Void") {
                return "void";
            }

            return typeName;
        } catch (error) {
            this.context.logger.warn(`Could not resolve return type for endpoint ${endpoint.id}, using Object`);
            return "Object";
        }
    }

    /**
     * Extracts the item type from a paginated endpoint and returns the java.Type.
     */
    private extractPaginationItemType(endpoint: HttpEndpoint): java.Type | undefined {
        if (!endpoint.pagination) {
            return undefined;
        }

        let resultsProperty: ResponseProperty | undefined;
        if (endpoint.pagination.type === "cursor") {
            resultsProperty = endpoint.pagination.results;
        } else if (endpoint.pagination.type === "offset") {
            resultsProperty = endpoint.pagination.results;
        }

        if (!resultsProperty?.property) {
            return undefined;
        }

        // Handle nested property paths (e.g., data.users)
        // The propertyPath tells us if we need to navigate through nested objects
        // but the actual list type is in the property itself
        const valueType = resultsProperty.property.valueType;
        if (!valueType) {
            return undefined;
        }

        // Extract the item type from the list/container type
        return this.extractItemTypeFromValueType(valueType);
    }

    /**
     * Recursively extracts the item type from a value type.
     */
    private extractItemTypeFromValueType(valueType: TypeReference): java.Type | undefined {
        if (!valueType) {
            return undefined;
        }

        // Handle container types
        if (valueType.type === "container" && valueType.container) {
            if (valueType.container.type === "list" && valueType.container.list) {
                // For list types, get the inner type
                const innerType = valueType.container.list;
                return this.context.javaTypeMapper.convert({ reference: innerType });
            } else if (valueType.container.type === "optional" && valueType.container.optional) {
                // Handle optional - recursively check the inner type
                return this.extractItemTypeFromValueType(valueType.container.optional);
            }
        }

        // If it's a named type, try to resolve it and look for list properties
        if (valueType.type === "named" && valueType.typeId) {
            const typeDecl = this.context.ir.types[valueType.typeId];
            if (typeDecl?.shape.type === "object") {
                // Look for properties that are lists
                for (const prop of typeDecl.shape.properties) {
                    const itemType = this.extractItemTypeFromValueType(prop.valueType);
                    if (itemType) {
                        return itemType;
                    }
                }
            }
        }

        // Can't extract a list item type
        return undefined;
    }

    /**
     * Converts a TypeReference to a Java type string.
     */
    private convertTypeReferenceToJavaType(typeRef: TypeReference): string {
        if (!typeRef) {
            return "Object";
        }

        try {
            const javaType = this.context.javaTypeMapper.convert({ reference: typeRef });
            const simpleWriter = new java.Writer({
                packageName: this.context.getCorePackageName(),
                customConfig: this.context.customConfig
            });
            javaType.write(simpleWriter);
            return simpleWriter.buffer.trim();
        } catch (error) {
            // Fallback to simple type extraction
            if (typeRef.type === "primitive") {
                switch (typeRef.primitive.v1) {
                    case "STRING":
                        return "String";
                    case "INTEGER":
                        return "Integer";
                    case "LONG":
                        return "Long";
                    case "DOUBLE":
                        return "Double";
                    case "BOOLEAN":
                        return "Boolean";
                    case "FLOAT":
                        return "Float";
                    case "UUID":
                        return "UUID";
                    default:
                        return "Object";
                }
            } else if (typeRef.type === "named" && typeRef.typeId) {
                // Try to get the type name from the typeId
                const typeDecl = this.context.ir.types[typeRef.typeId];
                if (typeDecl) {
                    return typeDecl.name.name.pascalCase.unsafeName;
                }
                return "Object";
            }
            return "Object";
        }
    }

    /**
     * Gets the return type for an endpoint and collects its imports.
     */
    public getEndpointReturnTypeWithImports(endpoint: HttpEndpoint): { typeName: string; imports: Set<string> } {
        try {
            const imports = new Set<string>();

            // Check if endpoint has pagination - if so, return SyncPagingIterable<T>
            if (endpoint.pagination != null) {
                const itemType = this.extractPaginationItemType(endpoint);
                if (itemType) {
                    // Add import for SyncPagingIterable
                    const paginationPackage = this.context.getCorePackageName() + ".pagination";
                    imports.add(`${paginationPackage}.SyncPagingIterable`);

                    // Use a temporary writer to get the item type name and its imports
                    const tempWriter = new java.Writer({
                        packageName: this.context.getCorePackageName(),
                        customConfig: this.context.customConfig
                    });

                    // Write the item type to collect its imports
                    itemType.write(tempWriter);

                    // Get the type name without package prefix
                    const itemTypeName = tempWriter.buffer.trim();

                    // Collect imports that were added when writing the type
                    tempWriter.getImports().forEach(imp => imports.add(imp));

                    return { typeName: `SyncPagingIterable<${itemTypeName}>`, imports };
                }
            }

            const javaType = this.context.getReturnTypeForEndpoint(endpoint);

            const simpleWriter = new java.Writer({
                packageName: this.context.getCorePackageName(),
                customConfig: this.context.customConfig
            });

            javaType.write(simpleWriter);

            const typeName = simpleWriter.buffer.trim();
            const writerImports = simpleWriter.getImports();
            writerImports.forEach(imp => imports.add(imp));

            if (typeName === "Void") {
                return { typeName: "void", imports };
            }

            return { typeName, imports };
        } catch (error) {
            this.context.logger.warn(`Could not resolve return type for endpoint ${endpoint.id}, using Object`);
            return { typeName: "Object", imports: new Set<string>() };
        }
    }

}
