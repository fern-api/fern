import { SetRequired } from "@fern-api/core-utils";
import { InterfaceDeclarationStructure } from "ts-morph";
import { FileContext } from "../file-context/FileContext.js";

export interface BaseClientContext {
    anyRequiredBaseClientOptions(context: FileContext): boolean;
    generateBaseClientOptionsInterface(context: FileContext): SetRequired<InterfaceDeclarationStructure, "properties">;
    anyRequiredBaseRequestOptions(context: FileContext): boolean;
    generateBaseRequestOptionsInterface(context: FileContext): SetRequired<InterfaceDeclarationStructure, "properties">;
    generateBaseIdempotentRequestOptionsInterface(
        context: FileContext
    ): SetRequired<InterfaceDeclarationStructure, "properties">;
}
