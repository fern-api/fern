import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { TypeDeclaration } from "@fern-fern/ir-model/types";
import { GeneratorContext, SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { TypeDeclarationHandler } from "@fern-typescript/types-v2";

export declare namespace ErrorDeclarationHandler {
    export interface Args {
        errorFile: SdkFile;
        schemaFile: SdkFile;
        errorName: string;
        context: GeneratorContext;
    }
}

export function ErrorDeclarationHandler(
    errorDeclaration: ErrorDeclaration,
    { errorFile, schemaFile, errorName, context }: ErrorDeclarationHandler.Args
): void {
    if (errorDeclaration.type._type === "alias" && errorDeclaration.type.aliasOf._type === "void") {
        return;
    }

    const typeDeclaration: TypeDeclaration = {
        name: errorDeclaration.name,
        docs: errorDeclaration.docs,
        shape: errorDeclaration.type,
        // TODO should we add these to errors?
        referencedTypes: [],
    };
    TypeDeclarationHandler(typeDeclaration, {
        typeFile: errorFile,
        typeName: errorName,
        schemaFile,
        context,
    });
}
