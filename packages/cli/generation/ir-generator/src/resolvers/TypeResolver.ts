import { ContainerType, TypeReference } from "@fern-api/ir-sdk";
import { FernWorkspace, getDefinitionFile } from "@fern-api/workspace-loader";
import { isRawAliasDefinition, RawSchemas, recursivelyVisitRawTypeReference } from "@fern-api/yaml-schema";
import { constructFernFileContext, FernFileContext } from "../FernFileContext";
import { parseInlineType } from "../utils/parseInlineType";
import { parseReferenceToTypeName } from "../utils/parseReferenceToTypeName";
import { ObjectPathItem, ResolvedType } from "./ResolvedType";

export interface TypeResolver {
    resolveType: (args: { type: string; file: FernFileContext }) => Promise<ResolvedType | undefined>;
    resolveTypeOrThrow: (args: { type: string; file: FernFileContext }) => Promise<ResolvedType>;
    getDeclarationOfNamedType: (args: {
        referenceToNamedType: string;
        file: FernFileContext;
    }) => Promise<RawTypeDeclarationInfo | undefined>;
    getDeclarationOfNamedTypeOrThrow: (args: {
        referenceToNamedType: string;
        file: FernFileContext;
    }) => Promise<RawTypeDeclarationInfo>;
    resolveNamedType: (args: {
        referenceToNamedType: string;
        file: FernFileContext;
    }) => Promise<ResolvedType | undefined>;
    resolveNamedTypeOrThrow: (args: { referenceToNamedType: string; file: FernFileContext }) => Promise<ResolvedType>;
}

export interface RawTypeDeclarationInfo {
    typeName: string;
    declaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
}

export class TypeResolverImpl implements TypeResolver {
    constructor(private readonly workspace: FernWorkspace) {}

    public async resolveTypeOrThrow({ type, file }: { type: string; file: FernFileContext }): Promise<ResolvedType> {
        const resolvedType = await this.resolveType({ type, file });
        if (resolvedType == null) {
            throw new Error("Cannot resolve type: " + type + " in file " + file.relativeFilepath);
        }
        return resolvedType;
    }

    public async getDeclarationOfNamedTypeOrThrow({
        referenceToNamedType,
        file
    }: {
        referenceToNamedType: string;
        file: FernFileContext;
    }): Promise<RawTypeDeclarationInfo> {
        const declaration = await this.getDeclarationOfNamedType({ referenceToNamedType, file });
        if (declaration == null) {
            throw new Error(
                "Cannot find declaration of type: " + referenceToNamedType + " in file " + file.relativeFilepath
            );
        }
        return declaration;
    }

    public async getDeclarationOfNamedType({
        referenceToNamedType,
        file
    }: {
        referenceToNamedType: string;
        file: FernFileContext;
    }): Promise<RawTypeDeclarationInfo | undefined> {
        const parsedReference = parseReferenceToTypeName({
            reference: referenceToNamedType,
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

        const declaration = definitionFile.types?.[parsedReference.typeName];
        if (declaration == null) {
            return undefined;
        }

        return {
            typeName: parsedReference.typeName,
            declaration,
            file: constructFernFileContext({
                relativeFilepath: parsedReference.relativeFilepath,
                definitionFile,
                casingsGenerator: file.casingsGenerator,
                rootApiFile: (await this.workspace.getDefinition()).rootApiFile.contents
            })
        };
    }

    public async resolveType({
        type,
        file,
        objectPath = []
    }: {
        type: string;
        file: FernFileContext;
        objectPath?: ObjectPathItem[];
    }): Promise<ResolvedType | undefined> {
        return recursivelyVisitRawTypeReference<Promise<ResolvedType | undefined>>({
            type,
            _default: undefined,
            validation: undefined,
            visitor: {
                primitive: async (primitive) => ({
                    _type: "primitive",
                    primitive,
                    originalTypeReference: TypeReference.primitive(primitive)
                }),
                unknown: async () => ({ _type: "unknown", originalTypeReference: TypeReference.unknown() }),
                map: async ({ keyType, valueType }) => {
                    const k = await keyType;
                    const v = await valueType;
                    return k != null && v != null
                        ? {
                              _type: "container",
                              container: {
                                  _type: "map",
                                  keyType: k,
                                  valueType: v
                              },
                              originalTypeReference: TypeReference.container(
                                  ContainerType.map({
                                      keyType: k.originalTypeReference,
                                      valueType: v.originalTypeReference
                                  })
                              )
                          }
                        : undefined;
                },
                list: async (itemType) => {
                    const item = await itemType;
                    return item != null
                        ? {
                              _type: "container",
                              container: {
                                  _type: "list",
                                  itemType: item
                              },
                              originalTypeReference: TypeReference.container(
                                  ContainerType.list(item.originalTypeReference)
                              )
                          }
                        : undefined;
                },
                optional: async (itemType) => {
                    const item = await itemType;
                    return item != null
                        ? {
                              _type: "container",
                              container: {
                                  _type: "optional",
                                  itemType: item
                              },
                              originalTypeReference: TypeReference.container(
                                  ContainerType.optional(item.originalTypeReference)
                              )
                          }
                        : undefined;
                },
                set: async (itemType) => {
                    const item = await itemType;
                    return item != null
                        ? {
                              _type: "container",
                              container: {
                                  _type: "set",
                                  itemType: item
                              },
                              originalTypeReference: TypeReference.container(
                                  ContainerType.set(item.originalTypeReference)
                              )
                          }
                        : undefined;
                },
                literal: async (literal) => ({
                    _type: "container",
                    container: {
                        _type: "literal",
                        literal
                    },
                    originalTypeReference: TypeReference.container(ContainerType.literal(literal))
                }),
                named: async (referenceToNamedType) => {
                    const maybeDeclaration = await this.getDeclarationOfNamedType({
                        referenceToNamedType,
                        file
                    });
                    if (maybeDeclaration == null) {
                        return undefined;
                    }

                    const newObjectPathItem: ObjectPathItem = {
                        typeName: maybeDeclaration.typeName,
                        file: maybeDeclaration.file.relativeFilepath,
                        reference: referenceToNamedType
                    };

                    // detect infinite loop
                    if (
                        objectPath.some(
                            (pathItem) =>
                                pathItem.file === newObjectPathItem.file &&
                                pathItem.typeName === newObjectPathItem.typeName
                        )
                    ) {
                        return undefined;
                    }

                    return await this.resolveNamedTypeFromDeclaration({
                        referenceToNamedType,
                        referencedIn: file,
                        rawDeclaration: maybeDeclaration,
                        objectPath: [...objectPath, newObjectPathItem]
                    });
                }
            }
        });
    }

    public async resolveNamedTypeOrThrow({
        referenceToNamedType,
        file
    }: {
        referenceToNamedType: string;
        file: FernFileContext;
    }): Promise<ResolvedType> {
        const resolvedType = await this.resolveNamedType({ referenceToNamedType, file });
        if (resolvedType == null) {
            throw new Error("Cannot resolve type: " + referenceToNamedType);
        }
        return resolvedType;
    }

    public async resolveNamedType({
        referenceToNamedType,
        file
    }: {
        referenceToNamedType: string;
        file: FernFileContext;
    }): Promise<ResolvedType | undefined> {
        const maybeDeclaration = await this.getDeclarationOfNamedType({
            referenceToNamedType,
            file
        });
        if (maybeDeclaration == null) {
            return undefined;
        }
        return this.resolveNamedTypeFromDeclaration({
            referenceToNamedType,
            referencedIn: file,
            rawDeclaration: maybeDeclaration
        });
    }

    private async resolveNamedTypeFromDeclaration({
        referenceToNamedType,
        referencedIn,
        rawDeclaration,
        objectPath = []
    }: {
        referencedIn: FernFileContext;
        referenceToNamedType: string;
        rawDeclaration: RawTypeDeclarationInfo;
        objectPath?: ObjectPathItem[];
    }): Promise<ResolvedType | undefined> {
        const { declaration, file: fileOfResolvedDeclaration } = rawDeclaration;

        if (isRawAliasDefinition(declaration)) {
            return await this.resolveType({
                type: typeof declaration === "string" ? declaration : declaration.type,
                file: fileOfResolvedDeclaration,
                objectPath
            });
        }

        const parsedTypeReference = parseInlineType({
            type: referenceToNamedType,
            _default: undefined,
            validation: undefined,
            file: referencedIn
        });
        if (parsedTypeReference.type !== "named") {
            return undefined;
        }

        const definitionFile = await getDefinitionFile(this.workspace, fileOfResolvedDeclaration.relativeFilepath);
        if (definitionFile == null) {
            return undefined;
        }

        return {
            _type: "named",
            rawName: rawDeclaration.typeName,
            name: parsedTypeReference,
            declaration,
            filepath: fileOfResolvedDeclaration.relativeFilepath,
            objectPath,
            originalTypeReference: parsedTypeReference,
            file: fileOfResolvedDeclaration
        };
    }
}
