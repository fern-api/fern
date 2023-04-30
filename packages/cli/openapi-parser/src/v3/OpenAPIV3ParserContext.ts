import { OpenAPIV3 } from "openapi-types";
import { SCHEMA_REFERENCE_PREFIX } from "./converters/convertSchemas";
import { isReferenceObject } from "./utils/isReferenceObject";

export class OpenAPIV3ParserContext {
    private document: OpenAPIV3.Document;

    constructor({ document }: { document: OpenAPIV3.Document }) {
        this.document = document;
    }

    public resolveSchemaReference(schema: OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject {
        if (
            this.document.components == null ||
            this.document.components.schemas == null ||
            !schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)
        ) {
            throw new Error(`Failed to resolve ${schema.$ref}`);
        }
        const schemaKey = schema.$ref.substring(SCHEMA_REFERENCE_PREFIX.length);
        const resolvedSchema = this.document.components.schemas[schemaKey];
        if (resolvedSchema == null) {
            throw new Error(`${schema.$ref} is undefined`);
        }
        if (isReferenceObject(resolvedSchema)) {
            return this.resolveSchemaReference(resolvedSchema);
        }
        return resolvedSchema;
    }
}
