import { OpenAPIV3_1 } from "openapi-types";

import { ResponseError, TypeReference } from "@fern-api/ir-sdk";
import { Converters, ERROR_NAMES_BY_STATUS_CODE } from "@fern-api/v2-importer-commons";

export declare namespace ResponseErrorConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        responseError: OpenAPIV3_1.ResponseObject;
        methodName: string;
        statusCode: number;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        error: ResponseError;
        errorType: TypeReference;
        displayName: string;
        statusCode: number;
    }
}

export class ResponseErrorConverter extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter {
    private readonly responseError: OpenAPIV3_1.ResponseObject;
    private readonly statusCode: number;
    private readonly methodName: string;

    constructor({
        context,
        breadcrumbs,
        responseError,
        group,
        method,
        methodName,
        statusCode
    }: ResponseErrorConverter.Args) {
        super({ context, breadcrumbs, group, method });
        this.responseError = responseError;
        this.statusCode = statusCode;
        this.methodName = methodName;
    }

    public convert(): ResponseErrorConverter.Output | undefined {
        if (!this.responseError.content) {
            // TODO: Handle 204 in a first class manner.
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.responseError.content).filter((type) => type.includes("json"));
        const errorName = ERROR_NAMES_BY_STATUS_CODE[this.statusCode];
        if (errorName == null) {
            this.context.logger.warn(`No error name found for status code ${this.statusCode}`);
            return undefined;
        }
        for (const contentType of [...jsonContentTypes]) {
            const mediaTypeObject = this.responseError.content?.[contentType];
            const convertedSchema = this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId: errorName
            });
            if (convertedSchema == null) {
                continue;
            }
            const errorId = this.context.enableUniqueErrorsPerEndpoint
                ? uppercaseFirstChar(`${this.methodName}Request${errorName}`)
                : errorName;
            if (convertedSchema.schema != null) {
                const error = {
                    error: {
                        name: this.context.casingsGenerator.generateName(errorId),
                        fernFilepath: convertedSchema.schema.name?.fernFilepath,
                        errorId
                    },
                    docs: this.responseError.description
                };
                return {
                    error,
                    errorType: convertedSchema.type,
                    displayName: errorName,
                    statusCode: this.statusCode,
                    inlinedTypes: convertedSchema.inlinedTypes,
                    examples: convertedSchema.examples
                };
            } else if (convertedSchema.type.type === "named") {
                const error = {
                    error: {
                        name: this.context.casingsGenerator.generateName(errorId),
                        fernFilepath: convertedSchema.type.fernFilepath,
                        errorId
                    },
                    docs: this.responseError.description
                };
                return {
                    error,
                    errorType: convertedSchema.type,
                    displayName: errorName,
                    statusCode: this.statusCode,
                    inlinedTypes: convertedSchema.inlinedTypes,
                    examples: convertedSchema.examples
                };
            }
        }
        return undefined;
    }
}

function uppercaseFirstChar(str: string): string {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}
