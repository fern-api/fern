import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { parseReferenceToTypeName } from "../utils/parseReferenceToTypeName";

export interface ErrorResolver {
    getDeclarationOrThrow(
        referenceToError: string,
        file: FernFileContext
    ): Promise<{ declaration: RawSchemas.ErrorDeclarationSchema; file: FernFileContext }>;
    getDeclaration(
        referenceToError: string,
        file: FernFileContext
    ): Promise<{ declaration: RawSchemas.ErrorDeclarationSchema; file: FernFileContext } | undefined>;
}

export class ErrorResolverImpl implements ErrorResolver {
    constructor(private readonly workspace: FernWorkspace) {}

    public async getDeclarationOrThrow(
        referenceToError: string,
        file: FernFileContext
    ): Promise<{ declaration: RawSchemas.ErrorDeclarationSchema; file: FernFileContext }> {
        const declaration = await this.getDeclaration(referenceToError, file);
        if (declaration == null) {
            throw new Error("Error does not exist: " + referenceToError);
        }
        return declaration;
    }

    public async getDeclaration(
        referenceToError: string,
        file: FernFileContext
    ): Promise<{ declaration: RawSchemas.ErrorDeclarationSchema; file: FernFileContext } | undefined> {
        const parsedReference = parseReferenceToTypeName({
            reference: referenceToError,
            referencedIn: file.relativeFilepath,
            imports: file.imports
        });

        if (parsedReference == null) {
            return undefined;
        }

        const definitionFile = await getDefinitionFile(this.workspace, parsedReference.relativeFilepath);
        if (definitionFile == null) {
            return undefined;
        }

        const declaration = definitionFile.errors?.[parsedReference.typeName];
        if (declaration == null) {
            return undefined;
        }

        return {
            declaration,
            file: constructFernFileContext({
                definitionFile,
                relativeFilepath: parsedReference.relativeFilepath,
                casingsGenerator: file.casingsGenerator,
                rootApiFile: (await this.workspace.getDefinition()).rootApiFile.contents
            })
        };
    }
}
