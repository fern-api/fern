import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import {
    ContainerType,
    HttpEndpoint,
    IntermediateRepresentation,
    ObjectProperty,
    QueryParameter,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { RequestGenerator } from "../inlined-request-body/RequestGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class QueryParameterRequestGenerator {
    private readonly ir: IntermediateRepresentation;
    private readonly context: ModelGeneratorContext;

    public constructor(context: ModelGeneratorContext) {
        this.ir = context.ir;
        this.context = context;
    }

    public generateFiles(): RustFile[] {
        const files: RustFile[] = [];

        // Process each service to find query-only endpoints
        for (const [serviceId, service] of Object.entries(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                // Generate for query-only endpoints (no request body)
                if (endpoint.queryParameters.length > 0 && !endpoint.requestBody) {
                    const file = this.generateQueryRequestFile(endpoint, serviceId);
                    if (file) {
                        files.push(file);
                    }
                }
            }
        }

        return files;
    }

    private generateQueryRequestFile(endpoint: HttpEndpoint, serviceId: string): RustFile | null {
        try {
            const baseRequestTypeName = this.context.getQueryRequestTypeName(endpoint, serviceId);
            // Get the unique type name (may have suffix if there's a collision)
            const uniqueRequestTypeName = this.context.getQueryRequestUniqueTypeName(endpoint.id);
            const properties = this.convertQueryParametersToProperties(endpoint.queryParameters);

            const objectGenerator = new RequestGenerator({
                name: uniqueRequestTypeName,
                properties,
                extendedProperties: [],
                docsContent: `Query parameters for ${endpoint.name.originalName}`,
                context: this.context
            });

            const filename = this.context.getFilenameForQueryRequest(endpoint.id);

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
