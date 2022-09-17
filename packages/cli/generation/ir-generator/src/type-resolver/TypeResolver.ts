import { RelativeFilePath } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { isRawAliasDefinition, RawSchemas, RAW_DEFAULT_ID_TYPE, ServiceFileSchema } from "@fern-api/yaml-schema";
import { DeclaredTypeName, TypeReference } from "@fern-fern/ir-model/types";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { parseInlineType } from "../utils/parseInlineType";
import { parseReferenceToTypeName } from "../utils/parseReferenceToTypeName";
import { ResolvedType } from "./ResolvedType";

export interface TypeResolver {
    resolveType: (args: { type: string; file: FernFileContext }) => ResolvedType;
}

export class TypeResolverImpl implements TypeResolver {
    constructor(private readonly workspace: Workspace) {}

    public resolveType({ type, file }: { type: string; file: FernFileContext }): ResolvedType {
        return this.resolveTypeRecursive({ type, file });
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
                const declaration = this.getDeclarationOfReferenceToNamedType({
                    referenceToNamedType: type,
                    parsedTypeName,
                    referencedIn: file.relativeFilepath,
                    imports: file.imports,
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

    private getDeclarationOfReferenceToNamedType({
        referenceToNamedType,
        parsedTypeName,
        referencedIn,
        imports,
        objectPath,
    }: {
        referenceToNamedType: string;
        parsedTypeName: DeclaredTypeName;
        referencedIn: RelativeFilePath;
        imports: Record<string, RelativeFilePath>;
        objectPath: string[];
    }): ResolvedType | undefined {
        const parsedReference = parseReferenceToTypeName({
            reference: referenceToNamedType,
            referencedIn,
            imports,
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

        if (isRawAliasDefinition(declaration)) {
            return this.resolveTypeRecursive({
                type: typeof declaration === "string" ? declaration : declaration.alias,
                file: constructFernFileContext({
                    relativeFilepath: parsedReference.relativeFilepath,
                    serviceFile,
                }),
                objectPath,
            });
        }

        return {
            _type: "named",
            name: parsedTypeName,
            declaration,
            filepath: parsedReference.relativeFilepath,
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
