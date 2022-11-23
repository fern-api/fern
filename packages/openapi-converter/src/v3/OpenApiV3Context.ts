import { Logger } from "@fern-api/logger";
import { OpenAPIV3 } from "openapi-types";
import { OpenApiV3ReferenceResolver } from "./OpenApiV3ReferenceResolver";

export class OpenApiV3Context {
    private openApiV3: OpenAPIV3.Document;
    private referenceResolver: OpenApiV3ReferenceResolver;

    constructor({ openApiV3, logger }: { openApiV3: OpenAPIV3.Document; logger: Logger }) {
        this.openApiV3 = openApiV3;
        this.referenceResolver = new OpenApiV3ReferenceResolver({ openApiV3, logger });
    }

    public getSchema(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject | undefined {
        return isReferenceObject(schema) ? this.referenceResolver.resolveSchemaReference(schema) : schema;
    }

    public getParameter(
        parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
    ): OpenAPIV3.ParameterObject | undefined {
        return isReferenceObject(parameter) ? this.referenceResolver.resolveParameterReference(parameter) : parameter;
    }
}

function isReferenceObject(
    parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject | OpenAPIV3.SchemaObject
): parameter is OpenAPIV3.ReferenceObject {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (parameter as OpenAPIV3.ReferenceObject).$ref != null;
}
