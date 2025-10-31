import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";

import {
    ContainerType,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpRequestBody,
    InlinedRequestBodyProperty,
    IntermediateRepresentation,
    PrimitiveType,
    PrimitiveTypeV1,
    QueryParameter,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { RequestGenerator } from "../inlined-request-body/RequestGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class FileUploadRequestBodyGenerator {
    private readonly ir: IntermediateRepresentation;
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
        requestBody: HttpRequestBody | undefined
    ): requestBody is HttpRequestBody.FileUpload {
        return requestBody?.type === "fileUpload";
    }

    private generateFileUploadRequestBodyFile(
        requestBody: HttpRequestBody.FileUpload,
        endpoint: HttpEndpoint
    ): RustFile | null {
        try {
            const filename = this.context.getFilenameForFileUploadRequestBody(endpoint.id);
            // Get the unique type name (may have suffix if there's a collision)
            const uniqueRequestName = this.context.getFileUploadRequestTypeName(endpoint.id);

            // Extract InlinedRequestBodyProperty from FileUploadRequestProperty union
            const bodyProperties = this.extractBodyProperties(requestBody.properties);

            // Add query parameters as properties for mixed endpoints
            if (endpoint.queryParameters?.length > 0) {
                const queryProperties = this.convertQueryParametersToProperties(endpoint.queryParameters);
                bodyProperties.push(...queryProperties);
            }

            // Create RequestGenerator to generate the struct with unique type name
            const objectGenerator = new RequestGenerator({
                name: uniqueRequestName,
                properties: bodyProperties, // Now includes query params
                extendedProperties: [],
                docsContent: undefined,
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
            this.context.logger?.warn(`Failed to generate file upload request body file: ${error}`);
            return null;
        }
    }

    // Extract InlinedRequestBodyProperty from FileUploadRequestProperty union
    private extractBodyProperties(properties: FileUploadRequestProperty[]): InlinedRequestBodyProperty[] {
        const bodyProperties: InlinedRequestBodyProperty[] = [];

        for (const property of properties) {
            // FileUploadRequestProperty is a union of file | bodyProperty
            // We use _visit to handle both cases
            property._visit({
                file: (fileProperty) => {
                    // For file properties, we need to visit the FileProperty to get the actual structure
                    fileProperty._visit({
                        file: (fileSingle) => {
                            // Single file upload - use BASE_64 primitive type (Vec<u8> in Rust)
                            const primitiveType: PrimitiveType = {
                                v1: PrimitiveTypeV1.Base64,
                                v2: undefined
                            };
                            const fileType = TypeReference.primitive(primitiveType);

                            bodyProperties.push({
                                name: fileSingle.key,
                                valueType: fileSingle.isOptional
                                    ? TypeReference.container(ContainerType.optional(fileType))
                                    : fileType,
                                docs: fileSingle.docs,
                                availability: undefined,
                                propertyAccess: undefined,
                                v2Examples: undefined
                            });
                        },
                        fileArray: (fileArray) => {
                            // Array of files - use list<BASE_64> (Vec<Vec<u8>> in Rust)
                            const primitiveType: PrimitiveType = {
                                v1: PrimitiveTypeV1.Base64,
                                v2: undefined
                            };
                            const fileType = TypeReference.primitive(primitiveType);
                            const listType = TypeReference.container(ContainerType.list(fileType));

                            bodyProperties.push({
                                name: fileArray.key,
                                valueType: fileArray.isOptional
                                    ? TypeReference.container(ContainerType.optional(listType))
                                    : listType,
                                docs: fileArray.docs,
                                availability: undefined,
                                propertyAccess: undefined,
                                v2Examples: undefined
                            });
                        },
                        _other: () => {
                            this.context.logger?.warn(`Unknown file property type encountered`);
                        }
                    });
                },
                bodyProperty: (bodyProperty) => {
                    // For body properties, use them directly as they are already InlinedRequestBodyProperty
                    bodyProperties.push(bodyProperty);
                },
                _other: () => {
                    this.context.logger?.warn(`Unknown file upload request property type encountered`);
                }
            });
        }

        return bodyProperties;
    }

    // Helper method to convert query parameters to object properties
    private convertQueryParametersToProperties(queryParams: QueryParameter[]): InlinedRequestBodyProperty[] {
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
