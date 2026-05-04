import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { convertQueryParametersToProperties } from "../utils/structUtils.js";
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
            const uniqueRequestName = this.context.getInlineRequestTypeName(endpoint.id);

            const allProperties = [...(requestBody.properties || []), ...(requestBody.extendedProperties || [])];

            let queryParamFieldNames = new Set<string>();
            if (endpoint.queryParameters?.length > 0) {
                const result = convertQueryParametersToProperties(endpoint.queryParameters, this.context);
                allProperties.push(...result.properties);
                queryParamFieldNames = result.fieldNames;
            }

            const objectGenerator = new RequestGenerator({
                name: uniqueRequestName,
                properties: allProperties,
                extendedProperties: [],
                docsContent: requestBody.docs,
                context: this.context,
                queryParamFieldNames
            });

            const fileContents = objectGenerator.generateFileContents();

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents
            });
        } catch (error) {
            this.context.logger?.warn(`Failed to generate inlined request body file: ${error}`);
            return null;
        }
    }
}
