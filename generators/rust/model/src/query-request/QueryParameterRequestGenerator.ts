import { getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { RequestGenerator } from "../inlined-request-body/RequestGenerator.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { convertQueryParametersToProperties } from "../utils/structUtils.js";

export class QueryParameterRequestGenerator {
    private readonly ir: FernIr.IntermediateRepresentation;
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

    private generateQueryRequestFile(endpoint: FernIr.HttpEndpoint, serviceId: string): RustFile | null {
        try {
            // Get the unique type name (may have suffix if there's a collision)
            const uniqueRequestTypeName = this.context.getQueryRequestUniqueTypeName(endpoint.id);
            const { properties } = convertQueryParametersToProperties(endpoint.queryParameters, this.context);

            const objectGenerator = new RequestGenerator({
                name: uniqueRequestTypeName,
                properties,
                extendedProperties: [],
                docsContent: `Query parameters for ${getOriginalName(endpoint.name)}`,
                context: this.context
            });

            const filename = this.context.getFilenameForQueryRequest(endpoint.id);

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents: objectGenerator.generateFileContents()
            });
        } catch (error) {
            this.context.logger?.warn(
                `Failed to generate query request file for endpoint ${getOriginalName(endpoint.name)}: ${error}`
            );
            return null;
        }
    }
}
