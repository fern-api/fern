import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { RequestGenerator } from "../inlined-request-body/RequestGenerator.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

/**
 * Generates request structs for endpoints with bytes body AND query parameters.
 * Instead of 30+ positional Option parameters, generates a single request struct
 * containing all query fields, while the bytes body is passed separately.
 */
export class BytesRequestGenerator {
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly context: ModelGeneratorContext;

    public constructor(context: ModelGeneratorContext) {
        this.ir = context.ir;
        this.context = context;
    }

    public generateFiles(): RustFile[] {
        const files: RustFile[] = [];

        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                // Generate for bytes endpoints with query parameters
                if (endpoint.requestBody?.type === "bytes" && endpoint.queryParameters.length > 0) {
                    const file = this.generateBytesRequestFile(endpoint);
                    if (file) {
                        files.push(file);
                    }
                }
            }
        }

        return files;
    }

    private generateBytesRequestFile(endpoint: FernIr.HttpEndpoint): RustFile | null {
        try {
            const uniqueRequestTypeName = this.context.getBytesRequestTypeName(endpoint.id);
            const properties = this.convertQueryParametersToProperties(endpoint.queryParameters);

            const objectGenerator = new RequestGenerator({
                name: uniqueRequestTypeName,
                properties,
                extendedProperties: [],
                docsContent: `Request parameters for ${endpoint.name.originalName}`,
                context: this.context
            });

            const filename = this.context.getFilenameForBytesRequest(endpoint.id);

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents: objectGenerator.generateFileContents()
            });
        } catch (error) {
            this.context.logger?.warn(
                `Failed to generate bytes request file for endpoint ${endpoint.name.originalName}: ${error}`
            );
            return null;
        }
    }

    private convertQueryParametersToProperties(queryParams: FernIr.QueryParameter[]): FernIr.ObjectProperty[] {
        return queryParams.map((queryParam) => {
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
