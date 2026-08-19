import { assertNever } from "@fern-api/core-utils";
import { BaseGoCustomConfigSchema, go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGoGeneratorContext } from "./AbstractGoGeneratorContext.js";

export declare namespace GoZeroValueMapper {
    interface Args {
        reference: FernIr.TypeReference;
    }
}

export class GoZeroValueMapper {
    private context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>;

    constructor(context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema>) {
        this.context = context;
    }

    public convert({ reference }: GoZeroValueMapper.Args): go.TypeInstantiation {
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
                return go.TypeInstantiation.nil();
            default:
                assertNever(reference);
        }
    }

    private convertContainer({ container }: { container: FernIr.ContainerType }): go.TypeInstantiation {
        switch (container.type) {
            case "list":
            case "map":
            case "set":
            case "optional":
            case "nullable":
                return go.TypeInstantiation.nil();
            case "literal":
                return this.convertLiteral({ literal: container.literal });
            default:
                assertNever(container);
        }
    }

    private convertPrimitive({ primitive }: { primitive: FernIr.PrimitiveType }): go.TypeInstantiation {
        return FernIr.PrimitiveTypeV1._visit<go.TypeInstantiation>(primitive.v1, {
            integer: () => go.TypeInstantiation.int(0),
            long: () => go.TypeInstantiation.int64(0),
            uint: () => go.TypeInstantiation.int(0),
            uint64: () => go.TypeInstantiation.int64(0),
            float: () => go.TypeInstantiation.float64(0),
            double: () => go.TypeInstantiation.float64(0),
            boolean: () => go.TypeInstantiation.bool(false),
            string: () => go.TypeInstantiation.string(""),
            date: () => this.context.getZeroTime(),
            dateTime: () => this.context.getZeroTime(),
            dateTimeRfc2822: () => this.context.getZeroTime(),
            uuid: () => this.context.getZeroUuid(),
            base64: () => go.TypeInstantiation.nil(),
            bigInteger: () => go.TypeInstantiation.string(""),
            _other: () => go.TypeInstantiation.nil()
        });
    }

    private convertLiteral({ literal }: { literal: FernIr.Literal }): go.TypeInstantiation {
        switch (literal.type) {
            case "boolean":
                return go.TypeInstantiation.bool(false);
            case "string":
                return go.TypeInstantiation.string("");
            default:
                assertNever(literal);
        }
    }

    private convertNamed({ named }: { named: FernIr.NamedType }): go.TypeInstantiation {
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(named.typeId);
        switch (typeDeclaration.shape.type) {
            case "alias":
                return this.convert({ reference: typeDeclaration.shape.aliasOf });
            case "object":
            case "enum":
            case "union":
            case "undiscriminatedUnion":
                return go.TypeInstantiation.nil();
            default:
                assertNever(typeDeclaration.shape);
        }
    }
}
