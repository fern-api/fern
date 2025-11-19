import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import {
    ContainerType,
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

    // Helper method to convert query parameters to object properties
    private convertQueryParametersToProperties(queryParams: QueryParameter[]): ObjectProperty[] {
        return queryParams.map((queryParam) => {
            // For allow-multiple query params, wrap the type in a list using proper IR constructors
            let valueType = queryParam.valueType;
            if (queryParam.allowMultiple) {
                valueType = TypeReference.container(ContainerType.list(queryParam.valueType));
            }

            return {
                name: queryParam.name,
                valueType,
                docs: queryParam.docs,
                availability: queryParam.availability,
                propertyAccess: undefined,
                v2Examples: undefined
            };
        });
    }
}
