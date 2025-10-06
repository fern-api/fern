import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import {
    HttpEndpoint,
    HttpRequestBody,
    IntermediateRepresentation,
    ObjectProperty,
    QueryParameter,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { RequestGenerator } from "./RequestGenerator";

export class InlinedRequestBodyGenerator {
    private readonly ir: IntermediateRepresentation;
    private readonly context: ModelGeneratorContext;

    public constructor(context: ModelGeneratorContext) {
        this.ir = context.ir;
        this.context = context;
    }

    public generateFiles(): RustFile[] {
        const files: RustFile[] = [];

        // Process each service to find inlined request bodies
        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (this.isInlinedRequestBody(endpoint.requestBody)) {
                    const file = this.generateInlinedRequestBodyFile(endpoint.requestBody, endpoint);
                    if (file) {
                        files.push(file);
                    }
                }
            }
        }

        return files;
    }

    private isInlinedRequestBody(
        requestBody: HttpRequestBody | undefined
    ): requestBody is HttpRequestBody.InlinedRequestBody {
        return requestBody?.type === "inlinedRequestBody";
    }

    private generateInlinedRequestBodyFile(
        requestBody: HttpRequestBody.InlinedRequestBody,
        endpoint: HttpEndpoint
    ): RustFile | null {
        try {
            const baseRequestName = requestBody.name.pascalCase.safeName;
            const filename = this.context.getFilenameForInlinedRequestBody(endpoint.id);
            // Get the unique type name (may have suffix if there's a collision)
            const uniqueRequestName = this.context.getInlineRequestTypeName(endpoint.id);

            // Combine body properties with query parameters for mixed endpoints
            const allProperties = [...(requestBody.properties || []), ...(requestBody.extendedProperties || [])];

            // Add query parameters as properties for mixed endpoints
            if (endpoint.queryParameters?.length > 0) {
                const queryProperties = this.convertQueryParametersToProperties(endpoint.queryParameters);
                allProperties.push(...queryProperties);
            }

            // Skip generating inline request body if it's a duplicate of an existing IR type
            // This happens when the inline request body is just a wrapper around a single existing type
            // with no additional properties or query parameters
            if (this.isDuplicateOfExistingType(requestBody, endpoint)) {
                this.context.logger?.debug(
                    `Skipping duplicate inline request body: ${baseRequestName} (matches existing IR type)`
                );
                return null;
            }

            // Create RequestGenerator to generate the struct with unique type name
            const objectGenerator = new RequestGenerator({
                name: uniqueRequestName,
                properties: allProperties, // Now includes query params
                extendedProperties: [],
                docsContent: requestBody.docs,
                context: this.context
            });

            // Generate the file content
            const fileContents = objectGenerator.generateFileContents();

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents
            });
        } catch (error) {
            // Log error but don't fail the entire generation
            this.context.logger?.warn(`Failed to generate inlined request body file: ${error}`);
            return null;
        }
    }

    // TODO: @iamnamananand996 simply this function/ remove it if possible

    /**
     * Check if an inline request body is a duplicate of an existing IR type.
     * This happens when:
     * 1. The inline request has exactly one property
     * 2. That property is a reference to an existing named type
     * 3. There are no query parameters
     * 4. There are no extended properties
     * 5. The existing type has the same fields as the inline request body
     */
    private isDuplicateOfExistingType(
        requestBody: HttpRequestBody.InlinedRequestBody,
        endpoint: HttpEndpoint
    ): boolean {
        // If there are query parameters, this is a mixed endpoint and needs its own type
        if (endpoint.queryParameters && endpoint.queryParameters.length > 0) {
            return false;
        }

        // If there are extended properties, this needs its own type
        if (requestBody.extendedProperties && requestBody.extendedProperties.length > 0) {
            return false;
        }

        // Get the properties
        const properties = requestBody.properties || [];

        // Check if this matches an existing IR type by comparing structure
        for (const irType of Object.values(this.ir.types)) {
            if (irType.shape.type !== "object") {
                continue;
            }

            const objectShape = irType.shape;
            const irProperties = objectShape.properties || [];

            // Check if property counts match
            if (irProperties.length !== properties.length) {
                continue;
            }

            // Check if all properties match (name and type)
            const allPropertiesMatch = properties.every((inlineProp) => {
                return irProperties.some((irProp) => {
                    // Match by property name
                    const nameMatches = irProp.name.wireValue === inlineProp.name.wireValue;
                    if (!nameMatches) {
                        return false;
                    }

                    // Match by type - both should be the same TypeReference
                    return this.typeReferencesEqual(irProp.valueType, inlineProp.valueType);
                });
            });

            if (allPropertiesMatch) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if two TypeReferences are equal
     */
    private typeReferencesEqual(type1: TypeReference, type2: TypeReference): boolean {
        if (type1.type !== type2.type) {
            return false;
        }

        return TypeReference._visit(type1, {
            primitive: (primitive1) => type2.type === "primitive" && primitive1.v1 === type2.primitive.v1,
            named: (named1) =>
                type2.type === "named" &&
                named1.name.pascalCase.safeName === type2.name.pascalCase.safeName &&
                named1.fernFilepath.allParts.length === type2.fernFilepath.allParts.length,
            container: (container1) => type2.type === "container" && container1.type === type2.container.type,
            unknown: () => type2.type === "unknown",
            _other: () => false
        });
    }

    // Helper method to convert query parameters to object properties
    private convertQueryParametersToProperties(queryParams: QueryParameter[]): ObjectProperty[] {
        return queryParams.map((queryParam) => ({
            name: queryParam.name,
            valueType: queryParam.valueType,
            docs: queryParam.docs,
            availability: queryParam.availability,
            propertyAccess: undefined,
            v2Examples: undefined
        }));
    }
}
