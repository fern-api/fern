import { FernFilepath, HttpHeader, ResponseError, TypeReference } from "@fern-api/ir-sdk";
import {
    Converters,
    convertResponseHeaders,
    ERROR_NAMES_BY_STATUS_CODE,
    ResponseHeaderConverter
} from "@fern-api/v3-importer-commons";
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
        headers: HttpHeader[];
    }
}

export class ResponseErrorConverter extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter {
    private readonly responseError: OpenAPIV3_1.ResponseObject;
    private readonly statusCode: number;
    private readonly methodName: string;
    private readonly isWildcardStatusCode?: boolean;
    private convertedResponseHeaders: ResponseHeaderConverter.Output | undefined;

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
            const errorName = this.getErrorNameForStatusCode(this.statusCode, this.isWildcardStatusCode);
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
                inlinedTypes: this.convertResponseHeaders().inlinedTypes,
                examples: {},
                headers: this.convertResponseHeaders().headers
            };
        }

        const jsonContentTypes = Object.keys(this.responseError.content).filter((type) => type.includes("json"));
        const errorName = this.getErrorNameForStatusCode(this.statusCode, this.isWildcardStatusCode);
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
                    convertedSchema,
                    mediaTypeObject
                });
            } else if (convertedSchema.type.type === "named") {
                return this.constructErrorConverterOutput({
                    errorName,
                    errorId,
                    fernFilepath: convertedSchema.type.fernFilepath,
                    convertedSchema,
                    mediaTypeObject
                });
            }
        }
        return undefined;
    }

    private constructErrorConverterOutput({
        errorName,
        errorId,
        fernFilepath,
        convertedSchema,
        mediaTypeObject
    }: {
        errorName: string;
        errorId: string;
        fernFilepath: FernFilepath;
        convertedSchema: Converters.AbstractConverters.AbstractMediaTypeObjectConverter.MediaTypeObject;
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
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
            inlinedTypes: {
                ...convertedSchema.inlinedTypes,
                ...this.convertResponseHeaders().inlinedTypes
            },
            examples: this.convertErrorExamples({ mediaTypeObject }),
            headers: this.convertResponseHeaders().headers
        };
    }

    /**
     * Converts error examples from the media type object, using the summary field
     * as the example name when available (similar to how endpoint examples work).
     */
    private convertErrorExamples({
        mediaTypeObject
    }: {
        mediaTypeObject: OpenAPIV3_1.MediaTypeObject;
    }): Record<string, OpenAPIV3_1.ExampleObject> | undefined {
        const examples = this.context.getNamedExamplesFromMediaTypeObject({
            mediaTypeObject,
            breadcrumbs: this.breadcrumbs,
            defaultExampleName: `${[...this.group, this.method].join("_")}_error_example`
        });

        if (examples.length === 0) {
            return undefined;
        }

        const usedExampleNames = new Set<string>();
        const result: Record<string, OpenAPIV3_1.ExampleObject> = {};

        for (const [key, example] of examples) {
            const resolvedExample = this.context.resolveExampleWithValue(example);
            const resolvedExampleObject = this.context.resolveExampleRecursively({
                example,
                breadcrumbs: this.breadcrumbs
            });
            const exampleName = this.getIdForErrorExample({ key, example: resolvedExampleObject, usedExampleNames });
            usedExampleNames.add(exampleName);

            if (resolvedExample != null) {
                result[exampleName] = resolvedExample as OpenAPIV3_1.ExampleObject;
            }
        }

        return Object.keys(result).length > 0 ? result : undefined;
    }

    /**
     * Determines the unique identifier for an error example, using the summary field
     * when available and handling duplicate collisions.
     */
    private getIdForErrorExample({
        key,
        example,
        usedExampleNames
    }: {
        key: string;
        example: unknown;
        usedExampleNames: Set<string>;
    }): string {
        if (this.context.isExampleWithSummary(example)) {
            const summary = example.summary;
            if (!usedExampleNames.has(summary)) {
                return summary;
            }
            const disambiguatedName = `${summary} (${key})`;
            return usedExampleNames.has(disambiguatedName) ? key : disambiguatedName;
        }
        return key;
    }

    private getErrorNameForStatusCode(statusCode: number, isWildcard?: boolean): string | undefined {
        if (isWildcard) {
            if (statusCode === 400) {
                return "ClientRequestError";
            }
            if (statusCode === 500) {
                return "ServerError";
            }
        }

        return ERROR_NAMES_BY_STATUS_CODE[statusCode];
    }

    private getErrorIdFromErrorName(errorName: string): string {
        return this.context.enableUniqueErrorsPerEndpoint
            ? uppercaseFirstChar(`${this.methodName}Request${errorName}`)
            : errorName;
    }

    private convertResponseHeaders(): ResponseHeaderConverter.Output {
        this.convertedResponseHeaders ??= convertResponseHeaders({
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            headers: this.responseError.headers
        });
        return this.convertedResponseHeaders;
    }
}

function uppercaseFirstChar(str: string): string {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}
