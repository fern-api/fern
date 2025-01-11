import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { assertNever } from "@fern-api/core-utils";
import {
    DefinitionFileSchema,
    RawSchemas,
    isRawDiscriminatedUnionDefinition,
    isRawEnumDefinition,
    isRawObjectDefinition,
    isRawUndiscriminatedUnionDefinition
} from "@fern-api/fern-definition-schema";
import {
    FernFileContext,
    ResolvedContainerType,
    ResolvedType,
    TypeResolver,
    TypeResolverImpl,
    constructFernFileContext,
    getAllPropertiesForObject
} from "@fern-api/ir-generator";

import { RuleRunnerArgs } from "./Rule";
import { CASINGS_GENERATOR } from "./utils/casingsGenerator";

export class ComplexQueryParamTypeDetector {
    private typeResolver: TypeResolver;

    constructor(private readonly workspace: FernWorkspace) {
        this.typeResolver = new TypeResolverImpl(workspace);
    }

    public isTypeComplex(type: string, ruleRunnerArgs: RuleRunnerArgs<DefinitionFileSchema>): boolean | undefined {
        const file = constructFernFileContext({
            relativeFilepath: ruleRunnerArgs.relativeFilepath,
            definitionFile: ruleRunnerArgs.contents,
            casingsGenerator: CASINGS_GENERATOR,
            rootApiFile: this.workspace.definition.rootApiFile.contents
        });
        const resolvedType = this.typeResolver.resolveType({
            type,
            file
        });
        if (resolvedType == null) {
            return undefined;
        }
        const visited = new Set<string>();
        return this.isResolvedReferenceComplex({
            type: resolvedType,
            file,
            visited
        });
    }

    private isResolvedReferenceComplex({
        type,
        file,
        visited
    }: {
        type: ResolvedType;
        file: FernFileContext;
        visited: Set<string>;
    }): boolean {
        switch (type._type) {
            case "container":
                return this.isResolvedContainerComplex({
                    type: type.container,
                    file,
                    visited
                });
            case "named":
                return this.isNamedTypeComplex({
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

    private isResolvedContainerComplex({
        type,
        file,
        visited
    }: {
        type: ResolvedContainerType;
        file: FernFileContext;
        visited: Set<string>;
    }): boolean {
        switch (type._type) {
            case "literal":
                return false;
            case "map":
                return (
                    (this.isResolvedReferenceComplex({
                        type: type.keyType,
                        file,
                        visited
                    }) ||
                        this.isResolvedReferenceComplex({
                            type: type.valueType,
                            file,
                            visited
                        })) &&
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
                return this.isResolvedReferenceComplex({
                    type: type.itemType,
                    file,
                    visited
                });
            default:
                assertNever(type);
        }
    }

    private isNamedTypeComplex({
        type,
        file,
        visited
    }: {
        type: ResolvedType.Named;
        file: FernFileContext;
        visited: Set<string>;
    }): boolean {
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
            return this.objectHasComplexProperties({
                typeName: type.rawName,
                objectDeclaration: type.declaration,
                file,
                visited
            });
        }
        if (isRawUndiscriminatedUnionDefinition(type.declaration)) {
            for (const variant of type.declaration.union) {
                const variantType = typeof variant === "string" ? variant : variant.type;
                const isVariantComplex = this.isTypeComplex(variantType, {
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

    private objectHasComplexProperties({
        typeName,
        objectDeclaration,
        file,
        visited
    }: {
        typeName: string;
        objectDeclaration: RawSchemas.ObjectSchema;
        file: FernFileContext;
        visited: Set<string>;
    }): boolean {
        const allPropertiesForObject = getAllPropertiesForObject({
            typeName,
            objectDeclaration,
            typeResolver: this.typeResolver,
            definitionFile: file.definitionFile,
            workspace: this.workspace,
            filepathOfDeclaration: file.relativeFilepath,
            smartCasing: false
        });
        return allPropertiesForObject.some((property) => {
            return this.isComplex({
                type: property.resolvedPropertyType,
                file,
                visited
            });
        });
    }

    private isComplex({
        type,
        file,
        visited
    }: {
        type: ResolvedType;
        file: FernFileContext;
        visited: Set<string>;
    }): boolean {
        switch (type._type) {
            case "named":
                return this.isNamedTypeComplex({
                    type,
                    file,
                    visited
                });
            case "primitive":
            case "unknown":
                return false;
            case "container":
                return this.isComplexContainer({
                    type: type.container,
                    file,
                    visited
                });
            default:
                assertNever(type);
        }
    }

    private isComplexContainer({
        type,
        file,
        visited
    }: {
        type: ResolvedContainerType;
        file: FernFileContext;
        visited: Set<string>;
    }): boolean {
        switch (type._type) {
            case "literal":
                // For now, we consider complex objects to be those that define any literals.
                return true;
            case "map":
                return (
                    this.isComplex({
                        type: type.keyType,
                        file,
                        visited
                    }) ||
                    this.isComplex({
                        type: type.valueType,
                        file,
                        visited
                    })
                );
            case "optional":
            case "list":
            case "set":
                return this.isComplex({
                    type: type.itemType,
                    file,
                    visited
                });
            default:
                assertNever(type);
        }
    }
}
