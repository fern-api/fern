import { ExportedFilePath } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

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
     * Get the TypeScript type node for the AuthOptions type (e.g., BearerAuthProvider.AuthOptions)
     * This is used to intersect with BaseClientOptions
     */
    getAuthOptionsType(): ts.TypeNode;

    /**
     * Get the auth-specific properties that should be included in AuthOptions
     * Returns undefined if this auth provider doesn't define any auth options
     */
    getAuthOptionsProperties(context: SdkContext): OptionalKind<PropertySignatureStructure>[] | undefined;

    /**
     * Generate instantiation of the concrete class with the provided constructor expressions
     */
    instantiate(constructorArgs: ts.Expression[]): ts.Expression;

    writeToFile(context: SdkContext): void;

    getFilePath(): ExportedFilePath;
}
