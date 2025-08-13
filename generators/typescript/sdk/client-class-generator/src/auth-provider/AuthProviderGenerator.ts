import { ExportedFilePath } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface AuthProviderGenerator {
    /**
     * Get the TypeScript type node for the concrete authentication class
     */
    getAuthProviderClassType(): ts.TypeNode;

    /**
     * Get the TypeScript type node for the options type passed to the constructor
     */
    getOptionsType(): ts.TypeNode;

    /**
     * Generate instantiation of the concrete class with the provided constructor expressions
     */
    instantiate(constructorArgs: ts.Expression[]): ts.Expression;

    writeToFile(context: SdkContext): void;

    getFilePath(): ExportedFilePath;
}
