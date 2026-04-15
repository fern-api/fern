import { assertNever } from "@fern-api/core-utils";
import { python } from "@fern-api/python-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { BasePythonCustomConfigSchema } from "../custom-config/BasePythonCustomConfigSchema.js";
import { AbstractPythonGeneratorContext } from "./AbstractPythonGeneratorContext.js";

export declare namespace PythonTypeMapper {
    interface Args {
        reference: FernIr.TypeReference;
    }
}

export class PythonTypeMapper {
    private context: AbstractPythonGeneratorContext<BasePythonCustomConfigSchema>;

    constructor(context: AbstractPythonGeneratorContext<BasePythonCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference }: PythonTypeMapper.Args): python.Type {
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
                return python.Type.any();
            default:
                assertNever(reference);
        }
    }

    public convertToClassReference({
        typeId,
        name
    }: {
        typeId: FernIr.TypeId;
        name: FernIr.NameOrString;
    }): python.Reference {
        return new python.Reference({
            name: this.context.getPascalCaseSafeName(name),
            modulePath: [...this.context.getModulePathForId(typeId), this.context.getSnakeCaseSafeName(name)]
        });
    }

    private convertContainer({ container }: { container: FernIr.ContainerType }): python.Type {
        switch (container.type) {
            case "list":
                return python.Type.list(this.convert({ reference: container.list }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                return python.Type.dict(key, value);
            }
            case "set":
                return python.Type.set(this.convert({ reference: container.set }));
            case "optional":
                return python.Type.optional(this.convert({ reference: container.optional }));
            case "nullable":
                return python.Type.optional(this.convert({ reference: container.nullable }));
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.PrimitiveType }): python.Type {
        return FernIr.PrimitiveTypeV1._visit<python.Type>(primitive.v1, {
            integer: () => python.Type.int(),
            long: () => python.Type.int(),
            uint: () => python.Type.int(),
            uint64: () => python.Type.int(),
            float: () => python.Type.float(),
            double: () => python.Type.float(),
            boolean: () => python.Type.bool(),
            string: () => python.Type.str(),
            date: () => python.Type.str(),
            dateTime: () => python.Type.datetime(),
            dateTimeRfc2822: () => python.Type.datetime(),
            uuid: () => python.Type.uuid(),
            base64: () => python.Type.bytes(),
            bigInteger: () => python.Type.str(),
            _other: () => python.Type.any()
        });
    }

    private convertLiteral({ literal }: { literal: FernIr.Literal }): python.Type {
        switch (literal.type) {
            case "boolean":
                return python.Type.bool();
            case "string":
                return python.Type.str();
        }
    }

    private convertNamed({ named }: { named: FernIr.DeclaredTypeName }): python.Type {
        const objectClassReference = this.convertToClassReference(named);
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf });
            case "enum":
                return python.Type.reference(objectClassReference);
            case "object":
                return python.Type.reference(objectClassReference);
            case "union":
                return python.Type.reference(objectClassReference);
            case "undiscriminatedUnion": {
                return python.Type.reference(objectClassReference);
            }
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
