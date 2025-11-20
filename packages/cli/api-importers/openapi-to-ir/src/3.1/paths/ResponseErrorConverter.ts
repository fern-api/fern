import { FernFilepath, ResponseError, TypeReference } from "@fern-api/ir-sdk";
import { Converters, ERROR_NAMES_BY_STATUS_CODE } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";

export declare namespace ResponseErrorConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        responseError: OpenAPIV3_1.ResponseObject;
        methodName: string;
        statusCode: number;
        isWildcardStatusCode?: boolean;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        error: ResponseError;
        errorType: TypeReference;
        displayName: string;
        statusCode: number;
        isWildcardStatusCode?: boolean;
    }
}

export class ResponseErrorConverter extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter {
    private readonly responseError: OpenAPIV3_1.ResponseObject;
    private readonly statusCode: number;
    private readonly methodName: string;
    private readonly isWildcardStatusCode?: boolean;

    constructor({
        context,
        breadcrumbs,
        responseError,
        group,
        method,
        methodName,
        statusCode,
        isWildcardStatusCode
    }: ResponseErrorConverter.Args) {
        super({ context, breadcrumbs, group, method });
        this.responseError = responseError;
        this.statusCode = statusCode;
        this.methodName = methodName;
        this.isWildcardStatusCode = isWildcardStatusCode;
    }

    public convert(): ResponseErrorConverter.Output | undefined {
        if (!this.responseError.content) {
            // TODO: Handle 204 in a first class manner.
            const errorName = ERROR_NAMES_BY_STATUS_CODE[this.statusCode];
            if (errorName == null) {
                this.context.logger.warn(`No error name found for status code ${this.statusCode}`);
                return undefined;
            }

            const errorId = this.getErrorIdFromErrorName(errorName);
            const error: ResponseError = {
                error: {
                    name: this.context.casingsGenerator.generateName(errorId),
                    fernFilepath: {
                        allParts: [],
                        packagePath: [],
                        file: undefined
                    },
                    errorId
                },
                docs: this.responseError.description
            };

            return {
                error,
                errorType: TypeReference.unknown(),
                displayName: errorName,
                statusCode: this.statusCode,
                isWildcardStatusCode: this.isWildcardStatusCode,
                inlinedTypes: {},
                examples: {}
            };
        }

        const jsonContentTypes = Object.keys(this.responseError.content).filter((type) => type.includes("json"));
        const errorName = ERROR_NAMES_BY_STATUS_CODE[this.statusCode];
        if (errorName == null) {
            this.context.logger.warn(`No error name found for status code ${this.statusCode}`);
            return undefined;
        }
        for (const contentType of [...jsonContentTypes]) {
            const mediaTypeObject = this.responseError.content?.[contentType];
            if (mediaTypeObject == null) {
                continue;
            }
            const convertedSchema = this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId: uppercaseFirstChar(`${this.methodName}Request${errorName}`),
                contentType
            });
            if (convertedSchema == null) {
                continue;
            }
            const errorId = this.getErrorIdFromErrorName(errorName);
            if (convertedSchema.schema != null) {
                return this.constructErrorConverterOutput({
                    errorName,
                    errorId,
                    fernFilepath: convertedSchema.schema.typeDeclaration.name.fernFilepath,
                    convertedSchema
                });
            } else if (convertedSchema.type.type === "named") {
                return this.constructErrorConverterOutput({
                    errorName,
                    errorId,
                    fernFilepath: convertedSchema.type.fernFilepath,
                    convertedSchema
                });
            }
        }
        return undefined;
    }

    private constructErrorConverterOutput({
        errorName,
        errorId,
        fernFilepath,
        convertedSchema
    }: {
        errorName: string;
        errorId: string;
        fernFilepath: FernFilepath;
        convertedSchema: Converters.AbstractConverters.AbstractMediaTypeObjectConverter.MediaTypeObject;
    }): ResponseErrorConverter.Output {
        return {
            error: {
                error: {
                    name: this.context.casingsGenerator.generateName(errorId),
                    fernFilepath,
                    errorId
                },
                docs: this.responseError.description
            },
            errorType: convertedSchema.type,
            displayName: errorName,
            statusCode: this.statusCode,
            isWildcardStatusCode: this.isWildcardStatusCode,
            inlinedTypes: convertedSchema.inlinedTypes,
            examples: convertedSchema.examples
        };
    }

    private getErrorIdFromErrorName(errorName: string): string {
        return this.context.enableUniqueErrorsPerEndpoint
            ? uppercaseFirstChar(`${this.methodName}Request${errorName}`)
            : errorName;
    }
}

function uppercaseFirstChar(str: string): string {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}
