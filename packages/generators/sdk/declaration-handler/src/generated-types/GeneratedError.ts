import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { ErrorContext } from "../contexts/ErrorContext";
import { BaseGenerated } from "./BaseGenerated";
import { GeneratedType } from "./GeneratedType";

export interface GeneratedError extends BaseGenerated<ErrorContext> {
    getEquivalentTypeDeclaration: () => TypeDeclaration;
    getAsGeneratedType: () => GeneratedType;
}
