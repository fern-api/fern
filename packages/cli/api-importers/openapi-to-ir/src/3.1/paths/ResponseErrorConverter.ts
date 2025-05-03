import { OpenAPIV3_1 } from "openapi-types";

import { ResponseError } from "@fern-api/ir-sdk";
import { Converters, SchemaOrReferenceConverter } from "@fern-api/v2-importer-commons";

export declare namespace ResponseErrorConverter {
    export interface Args extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Args {
        responseError: OpenAPIV3_1.ResponseObject;
        statusCode: string;
    }

    export interface Output extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter.Output {
        error: ResponseError;
    }
}

export class ResponseErrorConverter extends Converters.AbstractConverters.AbstractMediaTypeObjectConverter {
    private readonly responseError: OpenAPIV3_1.ResponseObject;
    private readonly statusCode: string;

    constructor({ context, breadcrumbs, responseError, group, method, statusCode }: ResponseErrorConverter.Args) {
        super({ context, breadcrumbs, group, method });
        this.responseError = responseError;
        this.statusCode = statusCode;
    }

    public async convert(): Promise<ResponseErrorConverter.Output | undefined> {
        if (!this.responseError.content) {
            // TODO: Handle 204 in a first class manner.
            return undefined;
        }

        const jsonContentTypes = Object.keys(this.responseError.content).filter((type) => type.includes("json"));
        const schemaId = [...this.group, this.method, "Response", this.statusCode].join("_");
        for (const contentType of [...jsonContentTypes]) {
            const mediaTypeObject = this.responseError.content?.[contentType];
            const convertedSchema = await this.parseMediaTypeObject({
                mediaTypeObject,
                schemaId
            });
            if (convertedSchema == null) {
                continue;
            }
            if (contentType.includes("json") && convertedSchema.schema != null) {
                const error = {
                    error: {
                        ...convertedSchema.schema?.name,
                        errorId: convertedSchema.schema?.name.typeId
                    },
                    docs: this.responseError.description
                };
                return {
                    error,
                    inlinedTypes: convertedSchema.inlinedTypes,
                    examples: convertedSchema.examples
                };
            }
        }
        return undefined;
    }
}
