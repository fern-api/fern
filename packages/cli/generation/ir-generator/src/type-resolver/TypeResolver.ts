import { RelativeFilePath } from "@fern-api/core-utils";
import { Workspace } from "@fern-api/workspace-loader";
import { visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { ResolvedTypeReference, ShapeType, TypeReference } from "@fern-fern/ir-model/types";
import path from "path";
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
                    reference: typeName.name,
                    referencedIn: RelativeFilePath.of(
                        typeName.fernFilepath.map((part) => part.originalValue).join(path.sep)
                    ),
                    imports: file.imports,
                });
                if (reference == null) {
                    throw new Error("Cannot find type: " + typeName.name);
                }
                const serviceFile = this.workspace.serviceFiles[reference.relativeFilePath];
                if (serviceFile == null) {
                    throw new Error("Cannot find file: " + reference.relativeFilePath);
                }
                const declaration = serviceFile.types?.[reference.typeName];
                if (declaration == null) {
                    throw new Error("Cannot find type declaration: " + reference.typeName);
                }
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
