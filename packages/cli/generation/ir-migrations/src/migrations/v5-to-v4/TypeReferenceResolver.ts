import { assertNever } from "@fern-api/core-utils";

import { IrVersions } from "../../ir-versions";
import { convertContainerType } from "./convertContainerType";
import { convertDeclaredTypeName } from "./convertDeclaredTypeName";

export interface TypeReferenceResolver {
    resolveTypeReference: (
        typeReference: IrVersions.V5.types.TypeReference
    ) => IrVersions.V4.types.ResolvedTypeReference;
}

type StringifiedTypeName = string;

export class TypeReferenceResolverImpl implements TypeReferenceResolver {
    private types: Record<StringifiedTypeName, IrVersions.V5.types.TypeDeclaration>;

    constructor(ir: IrVersions.V5.ir.IntermediateRepresentation) {
        this.types = ir.types.reduce(
            (acc, type) => ({
                ...acc,
                [stringifyTypeName(type.name)]: type
            }),
            {}
        );
    }

    public resolveTypeReference(
        typeReference: IrVersions.V5.types.TypeReference
    ): IrVersions.V4.types.ResolvedTypeReference {
        return IrVersions.V5.types.TypeReference._visit<IrVersions.V4.types.ResolvedTypeReference>(typeReference, {
            container: (container) =>
                IrVersions.V4.types.ResolvedTypeReference.container(convertContainerType(container)),
            named: (typeName) => {
                const typeDeclaration = this.getTypeDeclaration(typeName);
                if (typeDeclaration.shape._type === "alias") {
                    return this.resolveTypeReference(typeDeclaration.shape.aliasOf);
                }
                return IrVersions.V4.types.ResolvedTypeReference.named({
                    name: convertDeclaredTypeName(typeName),
                    shape: getTypeDeclarationShape(typeDeclaration.shape._type)
                });
            },
            primitive: IrVersions.V4.types.ResolvedTypeReference.primitive,
            unknown: IrVersions.V4.types.ResolvedTypeReference.unknown,
            _unknown: () => {
                throw new Error("Unknown TypeReference: " + typeReference._type);
            }
        });
    }

    private getTypeDeclaration(typeName: IrVersions.V5.types.DeclaredTypeName): IrVersions.V5.types.TypeDeclaration {
        const key = stringifyTypeName(typeName);
        const type = this.types[key];
        if (type == null) {
            throw new Error("Type does not exist: " + type);
        }
        return type;
    }
}

function stringifyTypeName(typeName: IrVersions.V5.types.DeclaredTypeName): string {
    return `${typeName.fernFilepath.join("/")}:${typeName.name.originalName}`;
}

function getTypeDeclarationShape(
    shape: Exclude<IrVersions.V5.types.Type["_type"], "alias">
): IrVersions.V4.types.ShapeType {
    switch (shape) {
        case "object":
            return IrVersions.V4.types.ShapeType.Object;
        case "union":
            return IrVersions.V4.types.ShapeType.Union;
        case "enum":
            return IrVersions.V4.types.ShapeType.Enum;
        default:
            assertNever(shape);
    }
}
