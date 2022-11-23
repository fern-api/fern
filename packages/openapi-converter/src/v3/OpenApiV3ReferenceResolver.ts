import { Logger } from "@fern-api/logger";
import { OpenAPIV3 } from "openapi-types";

const PARAMETER_REFERENCE_PREFIX = "#/components/parameters/";
const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";

export class OpenApiV3ReferenceResolver {
    private openApi: OpenAPIV3.Document;
    private logger: Logger;

    constructor({ openApiV3, logger }: { openApiV3: OpenAPIV3.Document; logger: Logger }) {
        this.openApi = openApiV3;
        this.logger = logger;
    }

    public resolveSchemaReference(
        schemaReference: OpenAPIV3.ReferenceObject
    ): OpenAPIV3.SchemaObject | undefined {
        if (this.openApi.components == null || this.openApi.components.schemas == null) {
            this.logger.error(`Missing schema reference: ${schemaReference.$ref}`);
            return undefined;
        }
        if (!schemaReference.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
            this.logger.error(`Invalid schema reference: ${schemaReference.$ref}`);
            return undefined;
        }
        const schemaKey = schemaReference.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
        const resolvedSchema = this.openApi.components.schemas[schemaKey];
        if (resolvedSchema == null) {
            this.logger.error(`Missing schema reference: ${schemaReference.$ref}`);
            return undefined;
        }
        if (isSchemaReferenceObject(resolvedSchema)) {
            return this.resolveSchemaReference(resolvedSchema);
        }
        return resolvedSchema;
    }

    public resolveParameterReference(
        parameterReference: OpenAPIV3.ReferenceObject
    ): OpenAPIV3.ParameterObject | undefined {
        if (this.openApi.components == null || this.openApi.components.parameters == null) {
            this.logger.error(`Missing parameter reference: ${parameterReference.$ref}`);
            return undefined;
        }
        if (!parameterReference.$ref.startsWith(PARAMETER_REFERENCE_PREFIX)) {
            this.logger.error(`Invalid parameter reference: ${parameterReference.$ref}`);
            return undefined;
        }
        const parameterKey = parameterReference.$ref.substring(PARAMETER_REFERENCE_PREFIX.length);
        const resolvedParameter = this.openApi.components.parameters[parameterKey];
        if (resolvedParameter == null) {
            this.logger.error(`Missing parameter reference: ${parameterReference.$ref}`);
            return undefined;
        }
        if (isParameterReferenceObject(resolvedParameter)) {
            return this.resolveParameterReference(resolvedParameter);
        }
        return resolvedParameter;
    }
}

function isSchemaReferenceObject(
    parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): parameter is OpenAPIV3.ReferenceObject {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (parameter as OpenAPIV3.ReferenceObject).$ref != null;
}

function isParameterReferenceObject(
    parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
): parameter is OpenAPIV3.ReferenceObject {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (parameter as OpenAPIV3.ReferenceObject).$ref != null;
}
