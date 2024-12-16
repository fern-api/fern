import { assertNever } from "@fern-api/core-utils";
import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    Name,
    PrimitiveType,
    PrimitiveTypeV1,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { ts } from "../";
import { Type } from "../ast";
import { BaseTypescriptCustomConfigSchema } from "../custom-config/BaseTypescriptCustomConfigSchema";
import { AbstractTypescriptGeneratorContext } from "./AbstractTypescriptGeneratorContext";

export declare namespace TypescriptTypeMapper {
    interface Args {
        reference: TypeReference;
    }
}

export class TypescriptTypeMapper {
    private context: AbstractTypescriptGeneratorContext<BaseTypescriptCustomConfigSchema>;

    constructor(context: AbstractTypescriptGeneratorContext<BaseTypescriptCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference }: TypescriptTypeMapper.Args): Type {
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
                return ts.Type.any();
            default:
                assertNever(reference);
        }
    }

    public convertToTypeReference(declaredTypeName: { typeId: TypeId; name: Name }): ts.Reference {
        return ts.reference({ name: declaredTypeName.name.originalName });
    }

    private convertContainer({ container }: { container: ContainerType }): Type {
        switch (container.type) {
            case "list":
                return ts.Type.array(this.convert({ reference: container.list }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                return ts.Type.nop();
            }
            case "set":
                return Type.array(this.convert({ reference: container.set }));
            case "optional":
                return ts.Type.nop();
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: PrimitiveType }): Type {
        return PrimitiveTypeV1._visit<ts.Type>(primitive.v1, {
            integer: () => ts.Type.number(),
            long: () => ts.Type.number(),
            uint: () => ts.Type.number(), // TODO: Add support for uint types in the Typescript generator.
            uint64: () => ts.Type.number(), // TODO: Add support for uint64 types in the Typescript generator.
            float: () => ts.Type.number(),
            double: () => ts.Type.number(),
            boolean: () => ts.Type.boolean(),
            string: () => ts.Type.string(),
            date: () => ts.Type.string(),
            dateTime: () => ts.Type.string(),
            uuid: () => ts.Type.string(),
            base64: () => ts.Type.string(),
            bigInteger: () => ts.Type.bigint(),
            _other: () => ts.Type.any()
        });
    }

    private convertLiteral({ literal }: { literal: Literal }): Type {
        switch (literal.type) {
            case "boolean":
                return ts.Type.boolean();
            case "string":
                return ts.Type.string();
        }
    }

    private convertNamed({ named }: { named: DeclaredTypeName }): Type {
        return ts.Type.nop();
    }
}
