import { assertNever } from "@fern-api/core-utils";
import {
    constructFernFileContext,
    FernFileContext,
    getAllPropertiesForObject,
    ResolvedContainerType,
    ResolvedType,
    TypeResolver,
    TypeResolverImpl
} from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import {
    DefinitionFileSchema,
    isRawDiscriminatedUnionDefinition,
    isRawEnumDefinition,
    isRawObjectDefinition,
    isRawUndiscriminatedUnionDefinition,
    RawSchemas
} from "@fern-api/yaml-schema";
import { RuleRunnerArgs } from "./Rule";
import { CASINGS_GENERATOR } from "./utils/casingsGenerator";

export class ComplexQueryParamTypeDetector {
    private typeResolver: TypeResolver;

    constructor(private readonly workspace: FernWorkspace) {
        this.typeResolver = new TypeResolverImpl(workspace);
    }

    public async isTypeComplex(
        type: string,
        ruleRunnerArgs: RuleRunnerArgs<DefinitionFileSchema>
    ): Promise<boolean | undefined> {
        const file = constructFernFileContext({
            relativeFilepath: ruleRunnerArgs.relativeFilepath,
            definitionFile: ruleRunnerArgs.contents,
            casingsGenerator: CASINGS_GENERATOR,
            rootApiFile: (await this.workspace.getDefinition()).rootApiFile.contents
        });
        const resolvedType = await this.typeResolver.resolveType({
            type,
            file
        });
        if (resolvedType == null) {
            return undefined;
        }
        const visited = new Set<string>();
        return await this.isResolvedReferenceComplex({
            type: resolvedType,
            file,
            visited
        });
    }

    private async isResolvedReferenceComplex({
        type,
        file,
        visited
    }: {
        type: ResolvedType;
        file: FernFileContext;
        visited: Set<string>;
    }): Promise<boolean> {
        switch (type._type) {
            case "container":
                return await this.isResolvedContainerComplex({
                    type: type.container,
                    file,
                    visited
                });
            case "named":
                return await this.isNamedTypeComplex({
                    type,
                    file,
                    visited
                });
            case "primitive":
                return false;
            case "unknown":
                return true;
            default:
                assertNever(type);
        }
    }

    private async isResolvedContainerComplex({
        type,
        file,
        visited
    }: {
        type: ResolvedContainerType;
        file: FernFileContext;
        visited: Set<string>;
    }): Promise<boolean> {
        switch (type._type) {
            case "literal":
                return false;
            case "map":
                return (
                    ((await this.isResolvedReferenceComplex({
                        type: type.keyType,
                        file,
                        visited
                    })) ||
                        (await this.isResolvedReferenceComplex({
                            type: type.valueType,
                            file,
                            visited
                        }))) &&
                    // This is how we denote generic objects, which we should allow to pass through.
                    !(
                        type.keyType._type === "primitive" &&
                        type.keyType.primitive.v1 === "STRING" &&
                        type.valueType._type === "unknown"
                    )
                );
            case "optional":
            case "list":
            case "set":
                return await this.isResolvedReferenceComplex({
                    type: type.itemType,
                    file,
                    visited
                });
            default:
                assertNever(type);
        }
    }

    private async isNamedTypeComplex({
        type,
        file,
        visited
    }: {
        type: ResolvedType.Named;
        file: FernFileContext;
        visited: Set<string>;
    }): Promise<boolean> {
        if (visited.has(type.rawName)) {
            return false;
        }
        visited.add(type.rawName);
        if (isRawDiscriminatedUnionDefinition(type.declaration)) {
            return true;
        }
        if (isRawEnumDefinition(type.declaration)) {
            return false;
        }
        if (isRawObjectDefinition(type.declaration)) {
            return await this.objectHasComplexProperties({
                typeName: type.rawName,
                objectDeclaration: type.declaration,
                file,
                visited
            });
        }
        if (isRawUndiscriminatedUnionDefinition(type.declaration)) {
            for (const variant of type.declaration.union) {
                const variantType = typeof variant === "string" ? variant : variant.type;
                const isVariantComplex = await this.isTypeComplex(variantType, {
                    contents: file.definitionFile,
                    relativeFilepath: file.relativeFilepath
                });
                if (isVariantComplex != null && isVariantComplex) {
                    return true;
                }
            }
            return false;
        }
        assertNever(type.declaration);
    }

    private async objectHasComplexProperties({
        typeName,
        objectDeclaration,
        file,
        visited
    }: {
        typeName: string;
        objectDeclaration: RawSchemas.ObjectSchema;
        file: FernFileContext;
        visited: Set<string>;
    }): Promise<boolean> {
        const allPropertiesForObject = await getAllPropertiesForObject({
            typeName,
            objectDeclaration,
            typeResolver: this.typeResolver,
            definitionFile: file.definitionFile,
            workspace: this.workspace,
            filepathOfDeclaration: file.relativeFilepath,
            smartCasing: false
        });

        const mappings = await Promise.all(
            allPropertiesForObject.map(async (property) => {
                return await this.isComplex({
                    type: property.resolvedPropertyType,
                    file,
                    visited
                });
            })
        );
        return mappings.some((property) => property);
    }

    private async isComplex({
        type,
        file,
        visited
    }: {
        type: ResolvedType;
        file: FernFileContext;
        visited: Set<string>;
    }): Promise<boolean> {
        switch (type._type) {
            case "named":
                return await this.isNamedTypeComplex({
                    type,
                    file,
                    visited
                });
            case "primitive":
            case "unknown":
                return false;
            case "container":
                return await this.isComplexContainer({
                    type: type.container,
                    file,
                    visited
                });
            default:
                assertNever(type);
        }
    }

    private async isComplexContainer({
        type,
        file,
        visited
    }: {
        type: ResolvedContainerType;
        file: FernFileContext;
        visited: Set<string>;
    }): Promise<boolean> {
        switch (type._type) {
            case "literal":
                // For now, we consider complex objects to be those that define any literals.
                return true;
            case "map":
                return (
                    (await this.isComplex({
                        type: type.keyType,
                        file,
                        visited
                    })) ||
                    (await this.isComplex({
                        type: type.valueType,
                        file,
                        visited
                    }))
                );
            case "optional":
            case "list":
            case "set":
                return await this.isComplex({
                    type: type.itemType,
                    file,
                    visited
                });
            default:
                assertNever(type);
        }
    }
}
