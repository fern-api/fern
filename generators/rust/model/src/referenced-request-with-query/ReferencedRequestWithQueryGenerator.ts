import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import {
    HttpEndpoint,
    HttpRequestBody,
    IntermediateRepresentation,
    ObjectProperty,
    QueryParameter
} from "@fern-fern/ir-sdk/api";

import { RequestGenerator } from "../inlined-request-body/RequestGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class ReferencedRequestWithQueryGenerator {
    private readonly ir: IntermediateRepresentation;
    private readonly context: ModelGeneratorContext;

    public constructor(context: ModelGeneratorContext) {
        this.ir = context.ir;
        this.context = context;
    }

    public generateFiles(): RustFile[] {
        const files: RustFile[] = [];

        // Process each service to find endpoints with referenced body + query parameters
        for (const [serviceId, service] of Object.entries(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                // Generate for endpoints with referenced body AND query parameters
                if (endpoint.requestBody?.type === "reference" && endpoint.queryParameters.length > 0) {
                    const file = this.generateReferencedRequestWithQueryFile(endpoint, serviceId);
                    if (file) {
                        files.push(file);
                    }
                }
            }
        }

        return files;
    }

    private generateReferencedRequestWithQueryFile(endpoint: HttpEndpoint, serviceId: string): RustFile | null {
        try {
            const uniqueRequestTypeName = this.context.getReferencedRequestWithQueryTypeName(endpoint.id);
            const referencedBody = endpoint.requestBody as HttpRequestBody.Reference;

            // Create properties: query parameters + body field
            const queryProperties = this.convertQueryParametersToProperties(endpoint.queryParameters);
            const bodyProperty: ObjectProperty = {
                name: {
                    name: {
                        originalName: "body",
                        camelCase: { unsafeName: "body", safeName: "body" },
                        snakeCase: { unsafeName: "body", safeName: "body" },
                        screamingSnakeCase: { unsafeName: "BODY", safeName: "BODY" },
                        pascalCase: { unsafeName: "Body", safeName: "Body" }
                    },
                    wireValue: "body"
                },
                valueType: referencedBody.requestBodyType,
                docs: referencedBody.docs,
                availability: undefined,
                propertyAccess: undefined,
                v2Examples: undefined
            };

            const properties = [...queryProperties, bodyProperty];

            const objectGenerator = new RequestGenerator({
                name: uniqueRequestTypeName,
                properties,
                extendedProperties: [],
                docsContent: `Request for ${endpoint.name.originalName} (body + query parameters)`,
                context: this.context
            });

            const filename = this.context.getFilenameForReferencedRequestWithQuery(endpoint.id);

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents: objectGenerator.generateFileContents()
            });
        } catch (error) {
            // Log error but don't fail the entire generation
            this.context.logger?.warn(
                `Failed to generate referenced request with query file for endpoint ${endpoint.name.originalName}: ${error}`
            );
            return null;
        }
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
