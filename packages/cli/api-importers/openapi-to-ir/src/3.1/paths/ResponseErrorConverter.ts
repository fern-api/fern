import {
    FernFilepath,
    HttpHeader,
    PrimitiveTypeV2,
    ResponseError,
    TypeReference,
    V2SchemaExamples
} from "@fern-api/ir-sdk";
import {
    AbstractConverter,
    Converters,
    ERROR_NAMES_BY_STATUS_CODE,
    ExampleConverter
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
                inlinedTypes: {},
                examples: {},
                headers: this.convertResponseHeaders()
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
            examples: convertedSchema.examples,
            headers: this.convertResponseHeaders()
        };
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

    private convertResponseHeaders(): HttpHeader[] {
        const headers: HttpHeader[] = [];
        const responseHeaders = this.responseError.headers;

        if (responseHeaders == null) {
            return headers;
        }

        for (const [headerName, headerOrRef] of Object.entries(responseHeaders)) {
            const resolvedHeader = this.context.resolveMaybeReference<OpenAPIV3_1.HeaderObject>({
                schemaOrReference: headerOrRef,
                breadcrumbs: [...this.breadcrumbs, "headers", headerName]
            });

            if (resolvedHeader == null) {
                continue;
            }

            const headerSchema = resolvedHeader.schema;
            let valueType: TypeReference = AbstractConverter.OPTIONAL_STRING;

            if (headerSchema != null) {
                const resolvedSchema = this.context.resolveMaybeReference<OpenAPIV3_1.SchemaObject>({
                    schemaOrReference: headerSchema,
                    breadcrumbs: [...this.breadcrumbs, "headers", headerName, "schema"]
                });

                if (resolvedSchema != null) {
                    if (resolvedSchema.type === "number" || resolvedSchema.type === "integer") {
                        valueType = TypeReference.primitive({
                            v1: resolvedSchema.type === "integer" ? "INTEGER" : "DOUBLE",
                            v2:
                                resolvedSchema.type === "integer"
                                    ? PrimitiveTypeV2.integer({ default: undefined, validation: undefined })
                                    : PrimitiveTypeV2.double({ default: undefined, validation: undefined })
                        });
                    } else if (resolvedSchema.type === "boolean") {
                        valueType = TypeReference.primitive({
                            v1: "BOOLEAN",
                            v2: PrimitiveTypeV2.boolean({ default: undefined })
                        });
                    }
                }
            }

            const v2Examples = this.convertHeaderExamples({
                header: resolvedHeader,
                headerName,
                schema: headerSchema
            });

            headers.push({
                name: this.context.casingsGenerator.generateNameAndWireValue({
                    name: headerName,
                    wireValue: headerName
                }),
                docs: resolvedHeader.description,
                valueType,
                env: undefined,
                v2Examples,
                availability: undefined
            });
        }

        return headers;
    }

    private convertHeaderExamples({
        header,
        headerName,
        schema
    }: {
        header: OpenAPIV3_1.HeaderObject;
        headerName: string;
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
    }): V2SchemaExamples {
        const v2Examples: V2SchemaExamples = {
            userSpecifiedExamples: {},
            autogeneratedExamples: {}
        };

        const headerExample = header.example;
        const headerExamples = header.examples;

        for (const [key, example] of Object.entries(headerExamples ?? {})) {
            const resolvedExample = this.context.resolveExampleWithValue(example);
            if (resolvedExample != null) {
                v2Examples.userSpecifiedExamples[key] = this.generateHeaderExample({
                    schema,
                    example: resolvedExample
                });
            }
        }

        if (headerExample != null) {
            const exampleName = this.context.generateUniqueName({
                prefix: `${headerName}_example`,
                existingNames: Object.keys(v2Examples.userSpecifiedExamples)
            });
            v2Examples.userSpecifiedExamples[exampleName] = this.generateHeaderExample({
                schema,
                example: headerExample
            });
        }

        if (Object.keys(v2Examples.userSpecifiedExamples).length === 0 && schema != null) {
            const exampleName = `${headerName}_example`;
            v2Examples.autogeneratedExamples[exampleName] = this.generateHeaderExample({
                schema,
                example: undefined,
                ignoreErrors: true
            });
        }

        return v2Examples;
    }

    private generateHeaderExample({
        schema,
        example,
        ignoreErrors
    }: {
        schema: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined;
        example: unknown;
        ignoreErrors?: boolean;
    }): unknown {
        if (schema == null) {
            return example;
        }

        const exampleConverter = new ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema,
            example
        });
        const { validExample: convertedExample, errors } = exampleConverter.convert();
        if (!ignoreErrors) {
            errors.forEach((error) => {
                this.context.errorCollector.collect({
                    message: error.message,
                    path: error.path
                });
            });
        }
        return convertedExample;
    }
}

function uppercaseFirstChar(str: string): string {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}
