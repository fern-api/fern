import { getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { convertQueryParametersToProperties } from "../utils/structUtils.js";
import { FileUploadRequestGenerator } from "./FileUploadRequestGenerator.js";

export class FileUploadRequestBodyGenerator {
    private readonly ir: FernIr.IntermediateRepresentation;
    private readonly context: ModelGeneratorContext;

    public constructor(context: ModelGeneratorContext) {
        this.ir = context.ir;
        this.context = context;
    }

    public generateFiles(): RustFile[] {
        const files: RustFile[] = [];

        // Process each service to find file upload request bodies
        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (this.isFileUploadRequestBody(endpoint.requestBody)) {
                    const file = this.generateFileUploadRequestBodyFile(endpoint.requestBody, endpoint);
                    if (file) {
                        files.push(file);
                    }
                }
            }
        }

        return files;
    }

    private isFileUploadRequestBody(
        requestBody: FernIr.HttpRequestBody | undefined
    ): requestBody is FernIr.HttpRequestBody.FileUpload {
        return requestBody?.type === "fileUpload";
    }

    private generateFileUploadRequestBodyFile(
        requestBody: FernIr.HttpRequestBody.FileUpload,
        endpoint: FernIr.HttpEndpoint
    ): RustFile | null {
        try {
            const filename = this.context.getFilenameForFileUploadRequestBody(endpoint.id);
            // Get the unique type name (may have suffix if there's a collision)
            const uniqueRequestName = this.context.getFileUploadRequestTypeName(endpoint.id);

            // Extract all properties and separate files from body properties
            const { allProperties, fileProperties, bodyProperties, queryParamFieldNames } = this.extractProperties(
                requestBody.properties,
                endpoint.queryParameters
            );

            // Create FileUploadRequestGenerator to generate the struct with to_multipart() method
            const generator = new FileUploadRequestGenerator({
                name: uniqueRequestName,
                properties: allProperties,
                fileProperties,
                bodyProperties,
                docsContent: undefined,
                context: this.context,
                queryParamFieldNames
            });

            // Generate the file content
            const fileContents = generator.generateFileContents();

            return new RustFile({
                filename,
                directory: RelativeFilePath.of("src"),
                fileContents
            });
        } catch (error) {
            // Log error but don't fail the entire generation
            this.context.logger?.warn(`Failed to generate file upload request body file: ${error}`);
            return null;
        }
    }

    // Extract all properties and categorize them
    private extractProperties(
        properties: FernIr.FileUploadRequestProperty[],
        queryParameters?: FernIr.QueryParameter[]
    ): {
        allProperties: FernIr.InlinedRequestBodyProperty[];
        fileProperties: Array<{ name: string; isArray: boolean; isOptional: boolean }>;
        bodyProperties: FernIr.InlinedRequestBodyProperty[];
        queryParamFieldNames: Set<string>;
    } {
        const allProperties: FernIr.InlinedRequestBodyProperty[] = [];
        const fileProperties: Array<{ name: string; isArray: boolean; isOptional: boolean }> = [];
        const bodyProperties: FernIr.InlinedRequestBodyProperty[] = [];

        for (const property of properties) {
            // FernIr.FileUploadRequestProperty is a union of file | bodyProperty
            property._visit({
                file: (fileProperty) => {
                    // For file properties, we need to visit the FileProperty to get the actual structure
                    fileProperty._visit({
                        file: (fileSingle) => {
                            // Single file upload - use BASE_64 primitive type (Vec<u8> in Rust)
                            const primitiveType: FernIr.PrimitiveType = {
                                v1: FernIr.PrimitiveTypeV1.Base64,
                                v2: undefined
                            };
                            const fileType = FernIr.TypeReference.primitive(primitiveType);

                            const prop: FernIr.InlinedRequestBodyProperty = {
                                name: fileSingle.key,
                                valueType: fileSingle.isOptional
                                    ? FernIr.TypeReference.container(FernIr.ContainerType.optional(fileType))
                                    : fileType,
                                docs: fileSingle.docs,
                                availability: undefined,
                                propertyAccess: undefined,
                                v2Examples: undefined
                            };

                            allProperties.push(prop);
                            fileProperties.push({
                                name: getOriginalName(fileSingle.key),
                                isArray: false,
                                isOptional: fileSingle.isOptional
                            });
                        },
                        fileArray: (fileArray) => {
                            // Array of files - use list<BASE_64> (Vec<Vec<u8>> in Rust)
                            const primitiveType: FernIr.PrimitiveType = {
                                v1: FernIr.PrimitiveTypeV1.Base64,
                                v2: undefined
                            };
                            const fileType = FernIr.TypeReference.primitive(primitiveType);
                            const listType = FernIr.TypeReference.container(FernIr.ContainerType.list(fileType));

                            const prop: FernIr.InlinedRequestBodyProperty = {
                                name: fileArray.key,
                                valueType: fileArray.isOptional
                                    ? FernIr.TypeReference.container(FernIr.ContainerType.optional(listType))
                                    : listType,
                                docs: fileArray.docs,
                                availability: undefined,
                                propertyAccess: undefined,
                                v2Examples: undefined
                            };

                            allProperties.push(prop);
                            fileProperties.push({
                                name: getOriginalName(fileArray.key),
                                isArray: true,
                                isOptional: fileArray.isOptional
                            });
                        },
                        _other: () => {
                            this.context.logger?.warn(`Unknown file property type encountered`);
                        }
                    });
                },
                bodyProperty: (bodyProperty) => {
                    // For body properties, use them directly as they are already FernIr.InlinedRequestBodyProperty
                    allProperties.push(bodyProperty);
                    bodyProperties.push(bodyProperty);
                },
                _other: () => {
                    this.context.logger?.warn(`Unknown file upload request property type encountered`);
                }
            });
        }

        // Add query parameters to struct fields but NOT to bodyProperties —
        // query params are sent as URL query string parameters, not multipart form fields.
        let queryParamFieldNames = new Set<string>();
        if (queryParameters && queryParameters.length > 0) {
            const result = convertQueryParametersToProperties(queryParameters, this.context);
            allProperties.push(...result.properties);
            queryParamFieldNames = result.fieldNames;
        }

        return { allProperties, fileProperties, bodyProperties, queryParamFieldNames };
    }
}
