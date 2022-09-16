import { Workspace } from "@fern-api/workspace-loader";
import { RawSchemas, RAW_DEFAULT_ID_TYPE, ServiceFileSchema, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { ResolvedTypeReference, ShapeType, TypeReference } from "@fern-fern/ir-model/types";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { parseInlineType } from "../utils/parseInlineType";
import { parseReferenceToTypeName } from "../utils/parseReferenceToTypeName";

export interface TypeResolver {
    resolveType: (args: { type: string; file: FernFileContext }) => ResolvedTypeReference;
}

export class TypeResolverImpl implements TypeResolver {
    constructor(private readonly workspace: Workspace) {}

    public resolveType({ type, file }: { type: string; file: FernFileContext }): ResolvedTypeReference {
        const parsedType = parseInlineType({ type, file });
        return TypeReference._visit<ResolvedTypeReference>(parsedType, {
            container: ResolvedTypeReference.container,
            primitive: ResolvedTypeReference.primitive,
            unknown: ResolvedTypeReference.unknown,
            void: ResolvedTypeReference.void,
            named: (typeName) => {
                const reference = parseReferenceToTypeName({
                    reference: type,
                    referencedIn: file.relativeFilepath,
                    imports: file.imports,
                });
                if (reference == null) {
                    throw new Error("Cannot find type: " + type);
                }
                const serviceFile = this.workspace.serviceFiles[reference.relativeFilePath];
                if (serviceFile == null) {
                    throw new Error("Cannot find file: " + reference.relativeFilePath);
                }

                const declaration = getDeclaration(serviceFile, reference.typeName);
                return visitRawTypeDeclaration(declaration, {
                    alias: (aliasDeclaration) => {
                        return this.resolveType({
                            type: typeof aliasDeclaration === "string" ? aliasDeclaration : aliasDeclaration.alias,
                            file: constructFernFileContext({
                                relativeFilepath: reference.relativeFilePath,
                                serviceFile,
                            }),
                        });
                    },
                    object: () =>
                        ResolvedTypeReference.named({
                            name: typeName,
                            shape: ShapeType.Object,
                        }),
                    union: () =>
                        ResolvedTypeReference.named({
                            name: typeName,
                            shape: ShapeType.Union,
                        }),
                    enum: () =>
                        ResolvedTypeReference.named({
                            name: typeName,
                            shape: ShapeType.Enum,
                        }),
                });
            },
            _unknown: () => {
                throw new Error("Unknown type reference type: " + parsedType._type);
            },
        });
    }
}

function getDeclaration(serviceFile: ServiceFileSchema, typeName: string): RawSchemas.TypeDeclarationSchema {
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

    throw new Error("Cannot find type declaration: " + typeName);
}
