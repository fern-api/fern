import { CaseConverter, getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { OpenAPIV3 } from "openapi-types";

import { convertServices } from "./converters/servicesConverter.js";
import { convertType } from "./converters/typeConverter.js";
import { constructEndpointSecurity, constructSecuritySchemes } from "./security.js";
import { convertAvailabilityStatus } from "./utils/convertAvailability.js";
import { Mode } from "./writeOpenApi.js";

export function convertToOpenApi({
    apiName,
    ir,
    mode
}: {
    apiName: string;
    ir: FernIr.IntermediateRepresentation;
    mode: Mode;
}): OpenAPIV3.Document | undefined {
    const caseConverter = new CaseConverter({
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: ir.casingsConfig?.smartCasing ?? true
    });
    const schemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {};

    const typesByName: Record<string, FernIr.TypeDeclaration> = {};
    Object.values(ir.types).forEach((typeDeclaration) => {
        // convert type to open api schema
        const convertedType = convertType(typeDeclaration, ir);
        const schema: Record<string, unknown> = {
            title: convertedType.schemaName,
            ...convertedType.openApiSchema
        };
        if (typeDeclaration.availability != null) {
            const availabilityValue = convertAvailabilityStatus(typeDeclaration.availability.status);
            if (availabilityValue != null) {
                schema["x-fern-availability"] = availabilityValue;
            }
        }
        schemas[convertedType.schemaName] = schema as OpenAPIV3.SchemaObject;
        // populates typesByName map
        typesByName[getDeclaredTypeNameKey(typeDeclaration.name)] = typeDeclaration;
    });

    const errorsByName: Record<string, FernIr.ErrorDeclaration> = {};
    Object.values(ir.errors).forEach((errorDeclaration) => {
        errorsByName[getErrorTypeNameKey(errorDeclaration.name)] = errorDeclaration;
    });

    const security = constructEndpointSecurity(ir.auth, caseConverter);

    const paths = convertServices({
        ir,
        httpServices: Object.values(ir.services),
        typesByName,
        errorsByName,
        errorDiscriminationStrategy: ir.errorDiscriminationStrategy,
        security,
        environments: ir.environments ?? undefined,
        mode,
        caseConverter
    });

    const info: OpenAPIV3.InfoObject = {
        title: ir.apiDisplayName ?? apiName,
        version: ""
    };
    if (ir.apiDocs != null) {
        info.description = ir.apiDocs;
    }

    const openAPISpec: OpenAPIV3.Document = {
        openapi: "3.0.1",
        info,
        paths,
        components: {
            schemas,
            securitySchemes: constructSecuritySchemes(ir.auth, caseConverter)
        }
    };

    if (ir.environments != null && ir.environments.environments.type === "singleBaseUrl") {
        openAPISpec.servers = ir.environments.environments.environments.map((environment) => {
            return {
                url: environment.url,
                description:
                    environment.docs != null
                        ? `${getOriginalName(environment.name)} (${environment.docs})`
                        : getOriginalName(environment.name)
            };
        });
    }

    return openAPISpec;
}

export function getDeclaredTypeNameKey(declaredTypeName: FernIr.DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.allParts.map((part) => getOriginalName(part)),
        getOriginalName(declaredTypeName.name)
    ].join("-");
}

export function getErrorTypeNameKey(declaredErrorName: FernIr.DeclaredErrorName): string {
    return [
        ...declaredErrorName.fernFilepath.allParts.map((part) => getOriginalName(part)),
        getOriginalName(declaredErrorName.name)
    ].join("-");
}
