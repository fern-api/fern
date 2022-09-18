import { Workspace } from "@fern-api/workspace-loader";
import { isRawAliasDefinition, RawSchemas, RAW_DEFAULT_ID_TYPE, ServiceFileSchema } from "@fern-api/yaml-schema";
import { DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { parseInlineType } from "../utils/parseInlineType";
import { parseReferenceToTypeName } from "../utils/parseReferenceToTypeName";
import { ResolvedType } from "./ResolvedType";

export interface TypeResolver {
    resolveType: (args: { type: string; file: FernFileContext }) => ResolvedType;
    getDeclarationOfNamedType: (args: {
        referenceToNamedType: string;
        file: FernFileContext;
    }) => { declaration: RawSchemas.TypeDeclarationSchema; file: FernFileContext } | undefined;
}

export class TypeResolverImpl implements TypeResolver {
    constructor(private readonly workspace: Workspace) {}

    public resolveType({ type, file }: { type: string; file: FernFileContext }): ResolvedType {
        return this.resolveTypeRecursive({ type, file });
    }

    public getDeclarationOfNamedType({
        referenceToNamedType,
        file,
    }: {
        referenceToNamedType: string;
        file: FernFileContext;
    }): { declaration: RawSchemas.TypeDeclarationSchema; file: FernFileContext } | undefined {
        const parsedReference = parseReferenceToTypeName({
            reference: referenceToNamedType,
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

        const declaration = getDeclarationInFile(serviceFile, parsedReference.typeName);
        if (declaration == null) {
            return undefined;
        }

        return {
            declaration,
            file: constructFernFileContext({
                relativeFilepath: parsedReference.relativeFilepath,
                serviceFile,
            }),
        };
    }

    private resolveTypeRecursive({
        type,
        file,
        objectPath = [],
    }: {
        type: string;
        file: FernFileContext;
        objectPath?: string[];
    }): ResolvedType {
        const parsedType = parseInlineType({ type, file });
        return TypeReference._visit<ResolvedType>(parsedType, {
            container: (container) => ({ _type: "container", container }),
            primitive: (primitive) => ({ _type: "primitive", primitive }),
            unknown: () => ({ _type: "unknown" }),
            void: () => ({ _type: "void" }),
            named: (parsedTypeName) => {
                const declaration = this.resolveNamedType({
                    referenceToNamedType: type,
                    parsedTypeName,
                    file,
                    objectPath: [...objectPath, type],
                });
                if (declaration == null) {
                    throw new Error("Cannot find type: " + type);
                }
                return declaration;
            },
            _unknown: () => {
                throw new Error("Unknown type reference type: " + parsedType._type);
            },
        });
    }

    private resolveNamedType({
        referenceToNamedType,
        parsedTypeName,
        file,
        objectPath,
    }: {
        referenceToNamedType: string;
        parsedTypeName: DeclaredTypeName;
        file: FernFileContext;
        objectPath: string[];
    }): ResolvedType | undefined {
        const maybeDeclaration = this.getDeclarationOfNamedType({
            referenceToNamedType,
            file,
        });
        if (maybeDeclaration == null) {
            return undefined;
        }
        const { declaration, file: fileOfResolvedDeclaration } = maybeDeclaration;

        if (isRawAliasDefinition(declaration)) {
            return this.resolveTypeRecursive({
                type: typeof declaration === "string" ? declaration : declaration.alias,
                file: fileOfResolvedDeclaration,
                objectPath,
            });
        }

        return {
            _type: "named",
            name: parsedTypeName,
            declaration,
            filepath: fileOfResolvedDeclaration.relativeFilepath,
            objectPath,
        };
    }
}

function getDeclarationInFile(
    serviceFile: ServiceFileSchema,
    typeName: string
): RawSchemas.TypeDeclarationSchema | undefined {
    const declaration = serviceFile.types?.[typeName];
    if (declaration != null) {
        return declaration;
    }

    const idDeclaration = serviceFile.ids?.find((id) =>
        typeof id === "string" ? id === typeName : id.name === typeName
    );
    if (idDeclaration != null) {
        if (typeof idDeclaration !== "string" && idDeclaration.type != null) {
            return idDeclaration.type;
        }
        return RAW_DEFAULT_ID_TYPE;
    }

    return undefined;
}
