import { Workspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { parseReferenceToTypeName } from "../utils/parseReferenceToTypeName";

export interface ErrorResolver {
    getDeclaration(referenceToError: string, file: FernFileContext): RawSchemas.ErrorDeclarationSchema | undefined;
}

export class ErrorResolverImpl implements ErrorResolver {
    constructor(private readonly workspace: Workspace) {}

    public getDeclaration(
        referenceToError: string,
        file: FernFileContext
    ): RawSchemas.ErrorDeclarationSchema | undefined {
        const parsedReference = parseReferenceToTypeName({
            reference: referenceToError,
            referencedIn: file.relativeFilepath,
            imports: file.imports,
        });

        if (parsedReference == null) {
            return undefined;
        }

        const serviceFile = this.workspace.serviceFiles[parsedReference.relativeFilepath];
        if (serviceFile == null) {
            return undefined;
        }

        return serviceFile.errors?.[parsedReference.typeName];
    }
}
