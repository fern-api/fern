import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "./converters/convertSchemas";
import { OpenAPIV3ParserContext } from "./OpenAPIV3ParserContext";
import { isReferenceObject } from "./utils/isReferenceObject";
import { isSchemaEqual } from "./utils/isSchemaEqual";

export class ErrorBodyCollector {
    private references: Set<string> = new Set();
    private schemas: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[] = [];
    private convertedSchemas: Schema[] = [];
    private context: OpenAPIV3ParserContext;

    constructor(context: OpenAPIV3ParserContext) {
        this.context = context;
    }

    public collect(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): void {
        if (isReferenceObject(schema)) {
            if (this.references.has(schema.$ref)) {
                // skip
            } else {
                this.schemas.push(schema);
                this.references.add(schema.$ref);
            }
        } else {
            const convertedCurrentSchema = convertSchema(schema, false, this.context, []);
            let isDupe = false;
            for (const convertedSchema of this.convertedSchemas) {
                isDupe = isSchemaEqual(convertedSchema, convertedCurrentSchema);
                if (isDupe) {
                    break;
                }
            }
            if (!isDupe) {
                this.schemas.push(schema);
                this.convertedSchemas.push(convertedCurrentSchema);
            }
        }
    }

    public getSchemas(): (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[] {
        return this.schemas;
    }
}
