import { SetRequired } from "@fern-api/core-utils";
import { InterfaceDeclarationStructure } from "ts-morph";
import { FileContext } from "../file-context/FileContext.js";

export interface BaseClientContext {
    anyRequiredBaseClientOptions(context: FileContext): boolean;
    generateBaseClientOptionsInterface(context: FileContext): SetRequired<InterfaceDeclarationStructure, "properties">;
    /**
     * The ids of global parameters that are actually materialized as a client
     * constructor option (i.e. not path-location and not skipped for colliding
     * with a reserved/declared option name). Request injection must be filtered
     * by this set so a global whose name collides with a built-in is never
     * injected reading the built-in option's value.
     */
    getInjectableGlobalParameterIds(context: FileContext): ReadonlySet<string>;
    anyRequiredBaseRequestOptions(context: FileContext): boolean;
    generateBaseRequestOptionsInterface(context: FileContext): SetRequired<InterfaceDeclarationStructure, "properties">;
    generateBaseIdempotentRequestOptionsInterface(
        context: FileContext
    ): SetRequired<InterfaceDeclarationStructure, "properties">;
}
