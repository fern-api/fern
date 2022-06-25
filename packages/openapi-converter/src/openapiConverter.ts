import SwaggerParser from "@apidevtools/swagger-parser";
import { RawSchemas } from "@fern-api/syntax-analysis";
import { OpenAPI, OpenAPIV3 } from "openapi-types";
import { convertToFernService } from "./serviceConverter";
import { convertToFernType } from "./typeConverter";

export declare namespace OpenApiConverter {
    type Result = SuccessfulResult | FailedResult;

    interface SuccessfulResult {
        didSucceed: true;
        fernConfiguration: RawSchemas.FernConfigurationSchema;
    }

    interface FailedResult {
        didSucceed: false;
        failure: OpenApiConversionFailure;
    }
}

export enum OpenApiConversionFailure {
    FAILED_TO_PARSE_OPENAPI,
    OTHER,
}

export async function convertOpenApi(openapiFilepath: string): Promise<OpenApiConverter.Result> {
    const openApi = await SwaggerParser.parse(openapiFilepath);
    if (openApi === undefined || !isOpenApiV3(openApi)) {
        return {
            didSucceed: false,
            failure: OpenApiConversionFailure.FAILED_TO_PARSE_OPENAPI,
        };
    }
    const convertedFernConfiguration: Required<RawSchemas.FernConfigurationSchema> = {
        errors: {},
        imports: {},
        ids: [],
        types: {},
        services: {},
    };
    try {
        if (openApi.components !== undefined && openApi.components.schemas !== undefined) {
            for (const typeName of Object.keys(openApi.components.schemas)) {
                const typeDeclaration = openApi.components.schemas[typeName];
                if (typeDeclaration !== undefined && isSchemaObject(typeDeclaration)) {
                    const fernConversionResult = convertToFernType(typeName, typeDeclaration);
                    for (const [convertedTypeName, convertedTypeDeclaration] of Object.entries(
                        fernConversionResult.typeDeclarations
                    )) {
                        convertedFernConfiguration.types[convertedTypeName] = convertedTypeDeclaration;
                    }
                }
            }
        }
        const fernService = convertToFernService(openApi.paths, openApi.components?.securitySchemes);
        convertedFernConfiguration.services["http"] = {};
        convertedFernConfiguration.services["http"]["OpenApiService"] = fernService;
        return {
            didSucceed: true,
            fernConfiguration: convertedFernConfiguration,
        };
    } catch (e) {
        console.log(e);
        return {
            didSucceed: false,
            failure: OpenApiConversionFailure.OTHER,
        };
    }
}

function isSchemaObject(
    typeDeclaration: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): typeDeclaration is OpenAPIV3.SchemaObject {
    return !(typeDeclaration as OpenAPIV3.ReferenceObject).$ref !== undefined;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    return (openApi as OpenAPIV3.Document).openapi !== undefined;
}
