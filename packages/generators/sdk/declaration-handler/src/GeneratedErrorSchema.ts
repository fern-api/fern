import { ErrorSchemaContext } from "./ErrorSchemaContext";

export interface GeneratedErrorSchema {
    writeToFile: (context: ErrorSchemaContext) => void;
}
