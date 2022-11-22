import SwaggerParser from "@apidevtools/swagger-parser";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPI, OpenAPIV3 } from "openapi-types";
import { convertToFernService } from "./serviceConverter";
import { convertToFernType } from "./typeConverter";

export declare namespace OpenApiConverter {
    type Result = SuccessfulResult | FailedResult;

    interface SuccessfulResult {
        didSucceed: true;
        fernConfiguration: RawSchemas.ServiceFileSchema;
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




export async function convertOpenApi(openapiFilepath: AbsoluteFilePath): Promise<OpenApiConverter.Result> {
    const openApi = await SwaggerParser.parse(openapiFilepath);
    if (!isOpenApiV3(openApi)) {
        return {
            didSucceed: false,
            failure: OpenApiConversionFailure.FAILED_TO_PARSE_OPENAPI,
        };
    }
    
    console.log(openApi);
    const convertedFernConfiguration: Required<RawSchemas.ServiceFileSchema> = {
        errors: {},
        imports: {},
        types: {},
        services: {},
    };
    try {
        if (openApi.components?.schemas != null) {
            for (const typeName of Object.keys(openApi.components.schemas)) {
                const typeDeclaration = openApi.components.schemas[typeName];
                if (typeDeclaration != null && isSchemaObject(typeDeclaration)) {
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
        convertedFernConfiguration.services.http = {};
        convertedFernConfiguration.services.http.OpenApiService = fernService;
        return {
            didSucceed: true,
            fernConfiguration: convertedFernConfiguration,
        };
    } catch (e) {
        // eslint-disable-next-line no-console
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return !(typeDeclaration as OpenAPIV3.ReferenceObject).$ref != null;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}
