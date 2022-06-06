import { RawSchemas } from "@fern-api/syntax-analysis";
import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIV3, OpenAPI } from "openapi-types";
import { convertToFernType } from "./typeConverter";
import { convertToFernService } from "./serviceConverter";

export declare namespace OpenApiConverter {
    type Result = SuccessfulResult | FailedResult;

    interface SuccessfulResult {
        didSucceed: true;
        fernConfiguration: RawSchemas.RawFernConfigurationSchema;
    }

    interface FailedResult {
        didSucceed: false;
        failure: OpenApiConversionFailure;
    }
}

export enum OpenApiConversionFailure {
    FAILED_TO_PARSE_OPENAPI,
}

export function convertOpenApi(openapiFilepath: string): OpenApiConverter.Result {
    let result: OpenApiConverter.Result | undefined = undefined;
    SwaggerParser.parse(openapiFilepath, (err, api) => {
        if (err || api === undefined || !isOpenApiV3(api)) {
            result = {
                didSucceed: false,
                failure: OpenApiConversionFailure.FAILED_TO_PARSE_OPENAPI,
            };
            return;
        }
        const convertedFernConfiguration: Required<RawSchemas.RawFernConfigurationSchema> = {
            errors: {},
            imports: {},
            ids: [],
            types: {},
            services: {},
        };

        if (api.components !== undefined && api.components.schemas !== undefined) {
            for (const typeName of Object.keys(api.components.schemas)) {
                const typeDefinition = api.components.schemas[typeName];
                if (typeDefinition !== undefined && isSchemaObject(typeDefinition)) {
                    const fernConversionResult = convertToFernType(typeName, typeDefinition);
                    for (const [convertedTypeName, convertedTypeDefinition] of Object.entries(
                        fernConversionResult.typeDefinitions
                    )) {
                        convertedFernConfiguration.types[convertedTypeName] = convertedTypeDefinition;
                    }
                }
            }
        }

        const fernService = convertToFernService(api.paths);
        convertedFernConfiguration.services["http"] = {};
        convertedFernConfiguration.services["http"]["OpenApiService"] = fernService;
        result = {
            didSucceed: true,
            fernConfiguration: convertedFernConfiguration,
        };
    });
    if (result == undefined) {
        throw new Error("Failed to convert OpenApi definition to fern");
    }
    return result;
}

function isSchemaObject(
    typeDefinition: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): typeDefinition is OpenAPIV3.SchemaObject {
    return !(typeDefinition as OpenAPIV3.ReferenceObject).$ref !== undefined;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    return (openApi as OpenAPIV3.Document).openapi !== undefined;
}
