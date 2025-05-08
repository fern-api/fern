import { assertNever } from "@fern-api/core-utils";
import {
    ContainerType,
    DeclaredErrorName,
    DeclaredTypeName,
    ErrorDeclaration,
    FernFilepath,
    HttpService,
    IntermediateRepresentation,
    Name,
    NameAndWireValue,
    ObjectProperty,
    SingleUnionTypeProperties,
    Type,
    TypeDeclaration,
    TypeReference
} from "@fern-api/ir-sdk";

export declare namespace IntermediateRepresentationChangeDetector {
    export type Result = {
        bump: "major" | "minor";
        isBreaking: boolean;
    };
}

export interface Error {
    message: string;
}

export class ErrorCollector {
    private errors: Error[];

    constructor() {
        this.errors = [];
    }

    public add(error: string): void {
        this.errors.push({ message: error });
    }

    public getErrors(): Error[] {
        return this.errors;
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }
}

/**
 * Detects breaking changes between intermediate representations of APIs.
 */
export class IntermediateRepresentationChangeDetector {
    private errors: ErrorCollector;

    constructor() {
        this.errors = new ErrorCollector();
    }

    public async detectChanges({
        from,
        to
    }: {
        from: IntermediateRepresentation;
        to: IntermediateRepresentation;
    }): Promise<IntermediateRepresentationChangeDetector.Result> {
        const isBreaking = this.isBreaking({ from, to });
        return {
            bump: isBreaking ? "major" : "minor",
            isBreaking
        };
    }

    private isBreaking({ from, to }: { from: IntermediateRepresentation; to: IntermediateRepresentation }): boolean {
        const typesBreakingChanges = this.detectTypeBreakingChanges({
            from: from.types,
            to: to.types
        });
        const errorsBreakingChanges = this.detectErrorsBreakingChanges({
            from: from.errors,
            to: to.errors
        });
        // const servicesBreakingChanges = this.detectServicesBreakingChanges({
        //     from: from.services,
        //     to: to.services
        // });
        return typesBreakingChanges || errorsBreakingChanges; // || servicesBreakingChanges;
    }

    private detectTypeBreakingChanges({
        from,
        to
    }: {
        from: Record<string, TypeDeclaration>;
        to: Record<string, TypeDeclaration>;
    }): boolean {
        return Object.entries(from).some(([typeId, fromType]) => {
            const toType = to[typeId];
            if (!toType) {
                return true;
            }
            return !this.areTypeDeclarationsCompatible({
                from: fromType,
                to: toType
            });
        });
    }

    private detectErrorsBreakingChanges({
        from,
        to
    }: {
        from: Record<string, ErrorDeclaration>;
        to: Record<string, ErrorDeclaration>;
    }): boolean {
        return Object.entries(from).some(([_, fromError]) => {
            const toError = Object.values(to).find((error) => error.statusCode === fromError.statusCode);
            if (!toError) {
                this.errors.add(`Error for status code "${fromError.statusCode}" was removed.`);
                return true;
            }
            return !this.areErrorsCompatible({
                from: fromError,
                to: toError
            });
        });
    }

    private areErrorsCompatible({ from, to }: { from: ErrorDeclaration; to: ErrorDeclaration }): boolean {
        if (from.type != null) {
            if (to.type == null) {
                this.errors.add(`Error with status code "${from.statusCode}" had its type removed.`);
                return false;
            }
            return this.areTypeReferencesCompatible({
                from: from.type,
                to: to.type
            });
        }
        return this.areDeclaredErrorNamesCompatible({
            from: from.name,
            to: to.name
        }) && this.areNameAndWireValuesCompatible({
            from: from.discriminantValue,
            to: to.discriminantValue
        });
    }

    private areTypeDeclarationsCompatible({ from, to }: { from: TypeDeclaration; to: TypeDeclaration }): boolean {
        return (
            this.areDeclaredTypeNamesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areTypeShapesCompatible({
                from: from.shape,
                to: to.shape
            })
        );
    }

    private areTypeShapesCompatible({ from, to }: { from: Type; to: Type }): boolean {
        switch (from.type) {
            case "alias":
                if (to.type === "alias") {
                    return this.areAliasTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "enum":
                if (to.type === "enum") {
                    return this.areEnumTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "object":
                if (to.type === "object") {
                    return this.areObjectTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "union":
                if (to.type === "union") {
                    return this.areUnionTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "undiscriminatedUnion":
                if (to.type === "undiscriminatedUnion") {
                    return this.areUndiscriminatedUnionTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(`Type "${from.type}" is not compatible with type "${to.type}".`);
        return false;
    }

    private areAliasTypesCompatible({ from, to }: { from: Type.Alias; to: Type.Alias }): boolean {
        return this.areTypeReferencesCompatible({
            from: from.aliasOf,
            to: to.aliasOf
        });
    }

    private areEnumTypesCompatible({ from, to }: { from: Type.Enum; to: Type.Enum }): boolean {
        const fromValues = Object.fromEntries(from.values.map((value) => [value.name.wireValue, value]));
        const toValues = Object.fromEntries(to.values.map((value) => [value.name.wireValue, value]));
        if (Object.keys(fromValues).length !== Object.keys(toValues).length) {
            return false;
        }
        return Object.values(fromValues).every((value) => {
            const toValue = toValues[value.name.wireValue];
            if (!toValue) {
                this.errors.add(`Enum value "${value.name.wireValue}" was removed.`);
                return false;
            }
            return this.areNameAndWireValuesCompatible({
                from: value.name,
                to: toValue.name
            });
        });
    }

    private areObjectTypesCompatible({ from, to }: { from: Type.Object_; to: Type.Object_ }): boolean {
        const fromProperties = Object.fromEntries([
            ...from.properties.map((property) => [property.name.wireValue, property] as const),
            ...(from.extendedProperties?.map((property) => [property.name.wireValue, property] as const) ?? [])
        ]);
        const toProperties = Object.fromEntries([
            ...to.properties.map((property) => [property.name.wireValue, property] as const),
            ...(to.extendedProperties?.map((property) => [property.name.wireValue, property] as const) ?? [])
        ]);
        return Object.values(fromProperties).every((property) => {
            const toProperty = toProperties[property.name.wireValue];
            if (!toProperty) {
                this.errors.add(`Object property "${property.name.wireValue}" was removed.`);
                return false;
            }
            return this.areObjectPropertiesCompatible({
                from: property,
                to: toProperty
            });
        });
    }

    private areObjectPropertiesCompatible({ from, to }: { from: ObjectProperty; to: ObjectProperty }): boolean {
        return (
            this.areNameAndWireValuesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areTypeReferencesCompatible({
                from: from.valueType,
                to: to.valueType
            })
        );
    }

    private areUnionTypesCompatible({ from, to }: { from: Type.Union; to: Type.Union }): boolean {
        if (
            !this.areNameAndWireValuesCompatible({
                from: from.discriminant,
                to: to.discriminant
            })
        ) {
            this.errors.add(`Union type with discriminant value "${from.discriminant.wireValue}" changed.`);
            return false;
        }

        const fromExtendsKeys = new Set(from.extends.map((value) => this.getKeyForDeclaration(value)));
        const toExtendsKeys = new Set(to.extends.map((value) => this.getKeyForDeclaration(value)));
        for (const fromExtendsKey of fromExtendsKeys) {
            if (!toExtendsKeys.has(fromExtendsKey)) {
                this.errors.add(`Extended type "${fromExtendsKey}" was removed.`);
                return false;
            }
        }

        const fromProperties = Object.fromEntries(from.baseProperties.map((value) => [value.name.wireValue, value]));
        const toProperties = Object.fromEntries(to.baseProperties.map((value) => [value.name.wireValue, value]));
        for (const property of Object.values(fromProperties)) {
            const toProperty = toProperties[property.name.wireValue];
            if (!toProperty) {
                this.errors.add(
                    `Union type with discriminant value "${property.name.wireValue}" no longer has a property named "${property.name.wireValue}".`
                );
                return false;
            }
            if (
                !this.areObjectPropertiesCompatible({
                    from: property,
                    to: toProperty
                })
            ) {
                return false;
            }
        }

        const fromTypes = Object.fromEntries(from.types.map((value) => [value.discriminantValue.wireValue, value]));
        const toTypes = Object.fromEntries(to.types.map((value) => [value.discriminantValue.wireValue, value]));
        return Object.values(fromTypes).every((value) => {
            const toValue = toTypes[value.discriminantValue.wireValue];
            if (!toValue) {
                this.errors.add(
                    `Union type for discriminant value "${value.discriminantValue.wireValue}" was removed.`
                );
                return false;
            }
            return this.areSingleUnionTypesCompatible({
                from: value.shape,
                to: toValue.shape
            });
        });
    }

    private areSingleUnionTypesCompatible({
        from,
        to
    }: {
        from: SingleUnionTypeProperties;
        to: SingleUnionTypeProperties;
    }): boolean {
        switch (from.propertiesType) {
            case "samePropertiesAsObject":
                if (to.propertiesType === "samePropertiesAsObject") {
                    return this.areDeclaredTypeNamesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "singleProperty":
                if (to.propertiesType === "singleProperty") {
                    return (
                        this.areNameAndWireValuesCompatible({
                            from: from.name,
                            to: to.name
                        }) &&
                        this.areTypeReferencesCompatible({
                            from: from.type,
                            to: to.type
                        })
                    );
                }
                break;
            case "noProperties":
                if (to.propertiesType === "noProperties") {
                    return true;
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(
            `Single union type of style "${from.propertiesType}" is not compatible with style "${to.propertiesType}".`
        );
        return false;
    }

    private areUndiscriminatedUnionTypesCompatible({
        from,
        to
    }: {
        from: Type.UndiscriminatedUnion;
        to: Type.UndiscriminatedUnion;
    }): boolean {
        // There isn't an easy way to uniquely identify each undiscriminated union member;
        // the best we can do is compare each member in the same order they're specified.
        //
        // This isn't perfect, so we'll need to restructure the IR to make this reliable.
        return from.members.every((member, index) => {
            const toMember = to.members[index];
            if (!toMember) {
                this.errors.add(`Undiscriminated union member at index ${index} was removed.`);
                return false;
            }
            return this.areTypeReferencesCompatible({
                from: member.type,
                to: toMember.type
            });
        });
    }

    private areTypeReferencesCompatible({ from, to }: { from: TypeReference; to: TypeReference }): boolean {
        switch (from.type) {
            case "primitive":
                if (to.type === "primitive") {
                    return this.arePrimitiveTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "container":
                if (to.type === "container") {
                    return this.areContainerTypesCompatible({
                        from: from.container,
                        to: to.container
                    });
                }
                break;
            case "named":
                if (to.type === "named") {
                    return this.areNamedTypesCompatible({
                        from,
                        to
                    });
                }
                break;
            case "unknown":
                if (to.type === "unknown") {
                    return true;
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(`TypeReference "${from.type}" is not compatible with type "${to.type}".`);
        return false;
    }

    private arePrimitiveTypesCompatible({
        from,
        to
    }: {
        from: TypeReference.Primitive;
        to: TypeReference.Primitive;
    }): boolean {
        return from.primitive.v1 === to.primitive.v1;
    }

    private areContainerTypesCompatible({ from, to }: { from: ContainerType; to: ContainerType }): boolean {
        switch (from.type) {
            case "list":
                if (to.type === "list") {
                    return this.areTypeReferencesCompatible({
                        from: from.list,
                        to: to.list
                    });
                }
                break;
            case "set":
                if (to.type === "set") {
                    return this.areTypeReferencesCompatible({
                        from: from.set,
                        to: to.set
                    });
                }
                break;
            case "map":
                if (to.type === "map") {
                    return (
                        this.areTypeReferencesCompatible({
                            from: from.keyType,
                            to: to.keyType
                        }) &&
                        this.areTypeReferencesCompatible({
                            from: from.valueType,
                            to: to.valueType
                        })
                    );
                }
                break;
            case "optional":
                if (to.type === "optional") {
                    return this.areTypeReferencesCompatible({
                        from: from.optional,
                        to: to.optional
                    });
                }
                break;
            case "nullable":
                if (to.type === "nullable") {
                    return this.areTypeReferencesCompatible({
                        from: from.nullable,
                        to: to.nullable
                    });
                }
                break;
            case "literal":
                if (to.type === "literal") {
                    return from.literal === to.literal;
                }
                break;
            default:
                assertNever(from);
        }
        this.errors.add(`Container type "${from.type}" is not compatible with type "${to.type}".`);
        return false;
    }

    private areNamedTypesCompatible({ from, to }: { from: TypeReference.Named; to: TypeReference.Named }): boolean {
        return this.areNamesCompatible({
            from: from.name,
            to: to.name
        }) && this.areFernFilepathsCompatible({
            from: from.fernFilepath,
            to: to.fernFilepath
        });
    }

    private areDeclaredTypeNamesCompatible({ from, to }: { from: DeclaredTypeName; to: DeclaredTypeName }): boolean {
        return (
            this.areNamesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areFernFilepathsCompatible({
                from: from.fernFilepath,
                to: to.fernFilepath
            })
        );
    }

    private areDeclaredErrorNamesCompatible({ from, to }: { from: DeclaredErrorName; to: DeclaredErrorName }): boolean {
        return (
            this.areNamesCompatible({
                from: from.name,
                to: to.name
            }) &&
            this.areFernFilepathsCompatible({
                from: from.fernFilepath,
                to: to.fernFilepath
            })
        );
    }


    private areNameAndWireValuesCompatible({ from, to }: { from: NameAndWireValue; to: NameAndWireValue }): boolean {
        return (
            this.areNamesCompatible({
                from: from.name,
                to: to.name
            }) && from.wireValue === to.wireValue
        );
    }

    private areFernFilepathsCompatible({ from, to }: { from: FernFilepath; to: FernFilepath }): boolean {
        if (from.allParts.length !== to.allParts.length) {
            return false;
        }
        return from.allParts.every((part, index) => {
            return this.areNamesCompatible({
                from: part,
                to: to.allParts[index]!
            });
        });
    }

    private areNamesCompatible({ from, to }: { from: Name; to: Name }): boolean {
        return from.originalName === to.originalName;
    }

    private getKeyForDeclaration({ name, fernFilepath }: { name: Name; fernFilepath: FernFilepath }): string {
        const prefix = fernFilepath.allParts.map((part) => part.camelCase.unsafeName).join(".");
        return `${prefix}.${name.pascalCase.unsafeName}`;
    }
}
