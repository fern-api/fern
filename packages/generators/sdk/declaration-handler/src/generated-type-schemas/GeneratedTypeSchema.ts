import { TypeSchemaContext } from "../TypeSchemaContext";

export interface GeneratedTypeSchema {
    writeToFile: (context: TypeSchemaContext) => void;
}
