import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { RequestGenerator } from "./RequestGenerator.js";

export class InlinedRequestBodyGenerator {
    private readonly ir: FernIr.IntermediateRepresentation;
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
        requestBody: FernIr.HttpRequestBody | undefined
    ): requestBody is FernIr.HttpRequestBody.InlinedRequestBody {
        return requestBody?.type === "inlinedRequestBody";
    }

    private generateInlinedRequestBodyFile(
        requestBody: FernIr.HttpRequestBody.InlinedRequestBody,
        endpoint: FernIr.HttpEndpoint
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
    private convertQueryParametersToProperties(queryParams: FernIr.QueryParameter[]): FernIr.ObjectProperty[] {
        return queryParams.map((queryParam) => {
            // For allow-multiple query params, wrap the type in a list using proper IR constructors
            let valueType = queryParam.valueType;
            if (queryParam.allowMultiple) {
                valueType = FernIr.TypeReference.container(FernIr.ContainerType.list(queryParam.valueType));
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
