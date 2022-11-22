import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { ErrorContext } from "../contexts/ErrorContext";
import { GeneratedType } from "./GeneratedType";

export interface GeneratedError {
    getEquivalentTypeDeclaration: () => TypeDeclaration;
    getAsGeneratedType: () => GeneratedType;
    writeToFile: (context: ErrorContext) => void;
}
