import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { ErrorContext } from "./ErrorContext";
import { GeneratedType } from "./generated-types";

export interface GeneratedError {
    getEquivalentTypeDeclaration: () => TypeDeclaration;
    getAsGeneratedType: () => GeneratedType;
    writeToFile: (context: ErrorContext) => void;
}
