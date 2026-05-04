import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { convertQueryParametersToProperties } from "../utils/structUtils.js";
import { RequestGenerator } from "../inlined-request-body/RequestGenerator.js";

export class BytesRequestBodyGenerator {
    private readonly context: ModelGeneratorContext;

    public constructor(context: ModelGeneratorContext) {
        this.context = context;
    }

    public generateFiles(): RustFile[] {
        const files: RustFile[] = [];

        for (const service of Object.values(this.context.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (this.isBytesEndpointWithQuery(endpoint)) {
                    const file = this.generateBytesRequestBodyFile(endpoint);
                    if (file) {
                        files.push(file);
                    }
                }
            }
        }

        return files;
    }

    private isBytesEndpointWithQuery(endpoint: FernIr.HttpEndpoint): boolean {
        return endpoint.requestBody?.type === "bytes" && endpoint.queryParameters.length > 0;
    }

    private generateBytesRequestBodyFile(endpoint: FernIr.HttpEndpoint): RustFile | null {
        try {
            const filename = this.context.getFilenameForBytesRequestBody(endpoint.id);
            const uniqueRequestName = this.context.getBytesRequestTypeName(endpoint.id);

            const allProperties: FernIr.InlinedRequestBodyProperty[] = [];
            const allSkipFields = new Set<string>();

            // Add body field as Vec<u8> (using Base64 primitive, same as FileUploadRequestBodyGenerator)
            const primitiveType: FernIr.PrimitiveType = {
                v1: FernIr.PrimitiveTypeV1.Base64,
                v2: undefined
            };
            const bodyType = FernIr.TypeReference.primitive(primitiveType);
            const bodyProp: FernIr.InlinedRequestBodyProperty = {
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
                valueType: bodyType,
                docs: undefined,
                availability: undefined,
                propertyAccess: undefined,
                v2Examples: undefined
            };
            allProperties.push(bodyProp);
            allSkipFields.add("body");

            // Add query parameters
            const { properties: queryProperties, fieldNames: queryParamFieldNames } =
                convertQueryParametersToProperties(endpoint.queryParameters, this.context);
            allProperties.push(...queryProperties);

            // Both body and query param fields skip serialization
            const skipFields = new Set([...allSkipFields, ...queryParamFieldNames]);

            const objectGenerator = new RequestGenerator({
                name: uniqueRequestName,
                properties: allProperties,
                extendedProperties: [],
                docsContent: undefined,
                context: this.context,
                queryParamFieldNames: skipFields
            });

            const fileContents = objectGenerator.generateFileContents();

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents
            });
        } catch (error) {
            this.context.logger?.warn(`Failed to generate bytes request body file: ${error}`);
            return null;
        }
    }
}
