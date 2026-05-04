import { getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { RequestGenerator } from "../inlined-request-body/RequestGenerator.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { convertQueryParametersToProperties } from "../utils/structUtils.js";

export class ReferencedRequestWithQueryGenerator {
    private readonly ir: FernIr.IntermediateRepresentation;
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

    private generateReferencedRequestWithQueryFile(endpoint: FernIr.HttpEndpoint, serviceId: string): RustFile | null {
        try {
            const uniqueRequestTypeName = this.context.getReferencedRequestWithQueryTypeName(endpoint.id);
            const referencedBody = endpoint.requestBody as FernIr.HttpRequestBody.Reference;

            // Create properties: query parameters + body field
            const { properties: queryProperties, fieldNames: queryParamFieldNames } =
                convertQueryParametersToProperties(endpoint.queryParameters, this.context);
            const bodyProperty: FernIr.ObjectProperty = {
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
                docsContent: `Request for ${getOriginalName(endpoint.name)} (body + query parameters)`,
                context: this.context,
                queryParamFieldNames
            });

            const filename = this.context.getFilenameForReferencedRequestWithQuery(endpoint.id);

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents: objectGenerator.generateFileContents()
            });
        } catch (error) {
            this.context.logger?.warn(
                `Failed to generate referenced request with query file for endpoint ${getOriginalName(endpoint.name)}: ${error}`
            );
            return null;
        }
    }
}
