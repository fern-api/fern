import { ErrorSchemaContext } from "../contexts/ErrorSchemaContext";

export interface GeneratedErrorSchema {
    writeToFile: (context: ErrorSchemaContext) => void;
}
