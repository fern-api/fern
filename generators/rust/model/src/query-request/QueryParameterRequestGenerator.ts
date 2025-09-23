import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { HttpEndpoint, IntermediateRepresentation, ObjectProperty, QueryParameter } from "@fern-fern/ir-sdk/api";

import { ObjectGenerator } from "../inlined-request-body/ObjectGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class QueryParameterRequestGenerator {
    private readonly ir: IntermediateRepresentation;
    private readonly context: ModelGeneratorContext;

    public constructor(ir: IntermediateRepresentation, context: ModelGeneratorContext) {
        this.ir = ir;
        this.context = context;
    }

    public generateFiles(): RustFile[] {
        const files: RustFile[] = [];

        // Process each service to find query-only endpoints
        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                // Generate for query-only endpoints (no request body)
                if (endpoint.queryParameters.length > 0 && !endpoint.requestBody) {
                    const file = this.generateQueryRequestFile(endpoint);
                    if (file) {
                        files.push(file);
                    }
                }
            }
        }

        return files;
    }

    private generateQueryRequestFile(endpoint: HttpEndpoint): RustFile | null {
        try {
            const requestTypeName = this.getQueryRequestTypeName(endpoint);
            const properties = this.convertQueryParametersToProperties(endpoint.queryParameters);

            const objectGenerator = new ObjectGenerator({
                name: requestTypeName,
                properties,
                extendedProperties: [],
                docsContent: `Query parameters for ${endpoint.name.originalName}`,
                context: this.context
            });

            const filename = this.getFilenameForQueryRequest(requestTypeName);

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents: objectGenerator.generateFileContents()
            });
        } catch (error) {
            // Log error but don't fail the entire generation
            this.context.logger?.warn(
                `Failed to generate query request file for endpoint ${endpoint.name.originalName}: ${error}`
            );
            return null;
        }
    }

    private getQueryRequestTypeName(endpoint: HttpEndpoint): string {
        // Generate query-specific request type name: GetUsersQueryRequest, SearchItemsQueryRequest, etc.
        const methodName = endpoint.name.pascalCase.safeName;
        return `${methodName}QueryRequest`;
    }

    private getFilenameForQueryRequest(requestTypeName: string): string {
        return this.context.getFilenameForQueryRequest(requestTypeName);
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
