import { assertNever } from "@fern-api/core-utils";
import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    PrimitiveType,
    PrimitiveTypeV1,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { ts } from "../";
import { Type } from "../ast";
import { type BaseTypescriptCustomConfigSchema } from "../custom-config/BaseTypescriptCustomConfigSchema";
import { BaseTypescriptGeneratorContext } from "./BaseTypescriptGeneratorContext";

export declare namespace TypescriptTypeMapper {
    interface Args {
        reference: TypeReference;
    }
}

export class TypescriptTypeMapper {
    constructor(private readonly context: BaseTypescriptGeneratorContext<BaseTypescriptCustomConfigSchema>) {}

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
                return ts.Type.unknown();
            default:
                assertNever(reference);
        }
    }

    private convertContainer({ container }: { container: ContainerType }): Type {
        switch (container.type) {
            case "list":
                return ts.Type.array(this.convert({ reference: container.list }));
            case "map": {
                const key = this.convert({ reference: container.keyType });
                const value = this.convert({ reference: container.valueType });
                if (value.internalType.type === "object") {
                    // object map values should be nullable.
                    return ts.Type.record(key, ts.Type.union([value, ts.Type.undefined()]));
                }
                return Type.record(key, value);
            }
            case "set":
                return Type.array(this.convert({ reference: container.set }));
            case "optional":
                return this.convert({ reference: container.optional });
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
            uint: () => ts.Type.number(),
            uint64: () => ts.Type.number(),
            float: () => ts.Type.number(),
            double: () => ts.Type.number(),
            boolean: () => ts.Type.boolean(),
            string: () => ts.Type.string(),
            date: () => ts.Type.string(),
            dateTime: () => ts.Type.date(),
            uuid: () => ts.Type.string(),
            // https://learn.microsoft.com/en-us/dotnet/api/system.convert.tobase64string?view=net-8.0
            base64: () => ts.Type.string(),
            bigInteger: () => ts.Type.string(),
            _other: () => ts.Type.object()
        });
    }

    private convertLiteral({ literal }: { literal: Literal }): Type {
        return ts.Type.literal(
            literal._visit<boolean | string>({
                boolean: (val) => val,
                string: (val) => val,
                _other: (val) => {
                    throw new Error(`Unrecognized literal type ${val}`);
                }
            })
        );
    }

    private convertNamed({ named }: { named: DeclaredTypeName }): Type {
        const reference = this.context.getReferenceToNamedType(named.typeId);
        return ts.Type.reference(reference);
    }
}
