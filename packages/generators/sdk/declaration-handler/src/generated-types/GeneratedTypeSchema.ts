import { TypeSchemaContext } from "../contexts/TypeSchemaContext";

export interface GeneratedTypeSchema {
    writeToFile: (context: TypeSchemaContext) => void;
}
