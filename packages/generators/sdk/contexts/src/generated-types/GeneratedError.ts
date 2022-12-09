import { ErrorContext } from "../contexts/ErrorContext";
import { GeneratedFile } from "./BaseGenerated";
import { GeneratedType } from "./GeneratedType";

export interface GeneratedError extends GeneratedFile<ErrorContext> {
    getAsGeneratedType: () => GeneratedType<ErrorContext>;
}
