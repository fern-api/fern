import { SetRequired } from "@fern-api/core-utils";
import { InterfaceDeclarationStructure } from "ts-morph";
import { SdkContext } from "../SdkContext";

export interface BaseClientContext {
    anyRequiredBaseClientOptions(context: SdkContext): boolean;
    generateBaseClientOptionsInterface(context: SdkContext): SetRequired<InterfaceDeclarationStructure, "properties">;
    anyRequiredBaseRequestOptions(context: SdkContext): boolean;
    generateBaseRequestOptionsInterface(context: SdkContext): SetRequired<InterfaceDeclarationStructure, "properties">;
    generateBaseIdempotentRequestOptionsInterface(
        context: SdkContext
    ): SetRequired<InterfaceDeclarationStructure, "properties">;
}
