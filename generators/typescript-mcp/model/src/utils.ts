import { ts } from "@fern-api/typescript-ast";

import {
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    PrimitiveTypeV1,
    SingleUnionType,
    TypeReference,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

function primitiveTypeV1Mapper(primitiveTypeV1: PrimitiveTypeV1) {
    return PrimitiveTypeV1._visit(primitiveTypeV1, {
        integer: () => "number()",
        long: () => "number()",
        uint: () => "number()",
        uint64: () => "number()",
        float: () => "number()",
        double: () => "number()",
        boolean: () => "boolean()",
        string: () => "string()",
        date: () => "date()",
        dateTime: () => "string().datetime()",
        uuid: () => "string().uuid()",
        base64: () => "string().base64()",
        bigInteger: () => "bigint()",
        _other: () => "any()"
    });
}

// TODO: finish this
function singleUnionTypeMapper(singleUnionType: SingleUnionType) {
    return singleUnionType.shape._visit({
        samePropertiesAsObject: (value) => "unknown()",
        singleProperty: (value) => "unknown()",
        noProperties: () => "unknown()",
        _other: (value) => "any()"
    });
}

// TODO: finish this
function typeReferenceMapper(typeReference: TypeReference) {
    return typeReference._visit({
        container: (value) => "unknown()",
        named: (value) => "unknown()",
        primitive: (value) => primitiveTypeV1Mapper(value.v1),
        unknown: () => "unknown()",
        _other: (value) => "any()"
    });
}

export declare namespace ReExportAsNamedNode {
    interface Args {
        /* The name of the reference */
        name: string;
        /* The module it's from */
        importFrom: ts.Reference.ModuleImport;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ReExportAsNamedNode extends ts.AstNode {
    public constructor(private readonly args: ReExportAsNamedNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.write("export ");
        switch (this.args.importFrom.type) {
            case "default":
                writer.write(`{ default as ${this.args.name} }`);
                break;
            case "star":
                writer.write(`{ * as ${this.args.name} }`);
                break;
            case "named":
                writer.write(this.args.name);
                break;
        }
        writer.write(` from "./${this.args.importFrom.moduleName}"`);
    }
}

export declare namespace ExportDefaultNode {
    interface Args {
        /* The initializer for the variable */
        initializer: ts.AstNode;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ExportDefaultNode extends ts.AstNode {
    public constructor(private readonly args: ExportDefaultNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.write("export default ");
        writer.writeNode(this.args.initializer);
    }
}

export declare namespace ZodAliasNode {
    interface Args {
        zodReference: ts.Reference;
        typeReference: TypeReference;
    }
}

export class ZodAliasNode extends ts.AstNode {
    public constructor(private readonly args: ZodAliasNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(this.args.zodReference);
        writer.write(`.${typeReferenceMapper(this.args.typeReference)}`);
    }
}

export declare namespace ZodEnumNode {
    interface Args {
        zodReference: ts.Reference;
        enumDeclaration: EnumTypeDeclaration;
    }
}

// TODO: test this thoroughly
export class ZodEnumNode extends ts.AstNode {
    public constructor(private readonly args: ZodEnumNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(this.args.zodReference);
        writer.write(".enum([");
        writer.newLine();
        writer.indent();
        for (const value of this.args.enumDeclaration.values) {
            writer.write(`"${value.name.name.originalName}",`);
            writer.newLine();
        }
        writer.dedent();
        writer.write("])");
    }
}

export declare namespace ZodObjectNode {
    interface Args {
        zodReference: ts.Reference;
        objectDeclaration: ObjectTypeDeclaration;
    }
}

export class ZodObjectNode extends ts.AstNode {
    public constructor(private readonly args: ZodObjectNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(this.args.zodReference);
        writer.write(".object({");
        writer.newLine();
        writer.indent();
        for (const property of this.args.objectDeclaration.properties) {
            writer.write(`${property.name.name.camelCase.safeName}: `);
            writer.writeNode(
                new ZodAliasNode({
                    zodReference: this.args.zodReference,
                    typeReference: property.valueType
                })
            );
            writer.write(",");
            writer.newLine();
        }
        writer.dedent();
        writer.write("})");
    }
}

export declare namespace ZodUnionNode {
    interface Args {
        zodReference: ts.Reference;
        unionDeclaration: UnionTypeDeclaration;
    }
}

// TODO: test this thoroughly
export class ZodUnionNode extends ts.AstNode {
    public constructor(private readonly args: ZodUnionNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(this.args.zodReference);
        writer.write(".union([");
        writer.newLine();
        writer.indent();
        for (const type of this.args.unionDeclaration.types) {
            writer.write(`"${singleUnionTypeMapper(type)}",`);
            writer.newLine();
        }
        writer.dedent();
        writer.write("])");
    }
}
