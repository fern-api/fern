import { NameInput } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { BaseGoCustomConfigSchema, go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGoGeneratorContext } from "./AbstractGoGeneratorContext.js";

export declare namespace GoTypeMapper {
    interface Args {
        reference: FernIr.TypeReference;
    }
}

export class GoTypeMapper {
    private context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>;

    constructor(context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference }: GoTypeMapper.Args): go.Type {
        switch (reference.type) {
            case "container":
                return this.convertContainer({
                    container: reference.container
                });
            case "named":
                return this.convertNamed({ named: reference });
            case "primitive":
                return this.convertPrimitive(reference);
            case "unknown":
                return go.Type.any();
            default:
                assertNever(reference);
        }
    }

    public convertToTypeReference(declaredTypeName: { typeId: FernIr.TypeId; name: NameInput }): go.TypeReference {
        return go.typeReference({
            name: this.context.getClassName(declaredTypeName.name),
            importPath: this.context.getLocationForTypeId(declaredTypeName.typeId).importPath
        });
    }

    private convertContainer({ container }: { container: FernIr.ContainerType }): go.Type {
        switch (container.type) {
            case "list":
                return go.Type.slice(this.convert({ reference: container.list }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                return go.Type.map(key, value);
            }
            case "set":
                return go.Type.slice(this.convert({ reference: container.set }));
            case "optional":
                return this.convertOptionalOrNullable(container.optional);
            case "nullable":
                return this.convertOptionalOrNullable(container.nullable);
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertOptionalOrNullable(innerReference: FernIr.TypeReference): go.Type {
        if (this.isPointerAliasReference(innerReference)) {
            return this.convert({ reference: innerReference });
        }
        return go.Type.optional(this.convert({ reference: innerReference }));
    }

    /**
     * Returns true if the type reference resolves to a named alias that already
     * generates as a pointer type in Go (i.e., the alias target is nullable or optional).
     * Also handles the collapse case where optional(nullable(named(alias))) should
     * collapse without producing a double pointer.
     */
    private isPointerAliasReference(reference: FernIr.TypeReference): boolean {
        if (reference.type === "named") {
            return this.isAliasToPointerType(reference.typeId);
        }
        if (
            reference.type === "container" &&
            (reference.container.type === "optional" || reference.container.type === "nullable")
        ) {
            const inner =
                reference.container.type === "optional" ? reference.container.optional : reference.container.nullable;
            if (inner.type === "named") {
                return this.isAliasToPointerType(inner.typeId);
            }
        }
        return false;
    }

    /**
     * Checks if a named type is an alias that already generates as a pointer in Go
     * (e.g. a nullable primitive like *time.Time). This prevents double pointers when
     * nullable(named(NullableDateAlias)) would otherwise produce *NullableDateAlias = **time.Time.
     */
    private isAliasToPointerType(typeId: FernIr.TypeId): boolean {
        const seen = new Set<FernIr.TypeId>();
        let currentTypeId: FernIr.TypeId = typeId;
        while (true) {
            if (seen.has(currentTypeId)) {
                return false;
            }
            seen.add(currentTypeId);
            const typeDeclaration = this.context.ir.types[currentTypeId];
            if (typeDeclaration == null || typeDeclaration.shape.type !== "alias") {
                return false;
            }
            const aliasOf = typeDeclaration.shape.aliasOf;
            if (
                aliasOf.type === "container" &&
                (aliasOf.container.type === "optional" || aliasOf.container.type === "nullable")
            ) {
                return true;
            }
            if (aliasOf.type === "named") {
                currentTypeId = aliasOf.typeId;
                continue;
            }
            return false;
        }
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.PrimitiveType }): go.Type {
        return FernIr.PrimitiveTypeV1._visit<go.Type>(primitive.v1, {
            integer: () => go.Type.int(),
            long: () => go.Type.int64(),
            uint: () => go.Type.int(),
            uint64: () => go.Type.int64(),
            float: () => go.Type.float64(),
            double: () => go.Type.float64(),
            boolean: () => go.Type.bool(),
            string: () => go.Type.string(),
            date: () => go.Type.date(),
            dateTime: () => go.Type.dateTime(),
            dateTimeRfc2822: () => go.Type.dateTime(),
            uuid: () => go.Type.uuid(),
            base64: () => go.Type.bytes(),
            bigInteger: () => go.Type.string(),
            _other: () => go.Type.any()
        });
    }

    private convertLiteral({ literal }: { literal: FernIr.Literal }): go.Type {
        switch (literal.type) {
            case "boolean":
                return go.Type.bool();
            case "string":
                return go.Type.string();
            default:
                assertNever(literal);
        }
    }

    private convertNamed({ named }: { named: FernIr.DeclaredTypeName }): go.Type {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return go.Type.reference(this.convertToTypeReference(named));
            case "object":
            case "enum":
            case "union":
            case "undiscriminatedUnion":
                return go.Type.pointer(go.Type.reference(this.convertToTypeReference(named)));
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
