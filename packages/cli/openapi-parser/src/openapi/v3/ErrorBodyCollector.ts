import { Schema } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../../schema/convertSchemas";
import { isReferenceObject } from "../../schema/utils/isReferenceObject";
import { isSchemaEqual } from "../../schema/utils/isSchemaEqual";
import { AbstractOpenAPIV3ParserContext } from "./AbstractOpenAPIV3ParserContext";

export class ErrorBodyCollector {
    private references: Set<string> = new Set();
    private schemas: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[] = [];
    private convertedSchemas: Schema[] = [];
    private context: AbstractOpenAPIV3ParserContext;

    constructor(context: AbstractOpenAPIV3ParserContext) {
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
