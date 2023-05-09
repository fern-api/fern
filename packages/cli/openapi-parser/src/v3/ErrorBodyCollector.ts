import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "./utils/isReferenceObject";

export class ErrorBodyCollector {
    private references: Set<string> = new Set();
    private schemas: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[] = [];

    public collect(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): void {
        if (isReferenceObject(schema)) {
            if (this.references.has(schema.$ref)) {
                // skip
            } else {
                this.schemas.push(schema);
                this.references.add(schema.$ref);
            }
        } else {
            this.schemas.push(schema);
        }
    }

    public getSchemas(): (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[] {
        return this.schemas;
    }
}
