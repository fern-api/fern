import { ts } from "@fern-api/typescript-ast";

import { PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

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

function typeReferenceMapper(typeReference: TypeReference) {
    return typeReference._visit({
        container: () => "unknown()",
        named: () => "unknown()",
        primitive: (value) => primitiveTypeV1Mapper(value.v1),
        unknown: () => "unknown()",
        _other: () => "any()"
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

export declare namespace ZodImportNode {
    interface Args {
        importFrom: ts.Reference.ModuleImport;
    }
}

export class ZodImportNode extends ts.AstNode {
    public constructor(private readonly args: ZodImportNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.write("import ");
        switch (this.args.importFrom.type) {
            case "default":
                writer.write("z");
                break;
            case "star":
                writer.write("* as z");
                break;
            case "named":
                writer.write("{ z }");
                break;
        }
        writer.write(` from "${this.args.importFrom.moduleName}"`);
    }
}

export declare namespace ZodAliasNode {
    interface Args {
        typeReference: TypeReference;
    }
}

export class ZodAliasNode extends ts.AstNode {
    public constructor(private readonly args: ZodAliasNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.write(`z.${typeReferenceMapper(this.args.typeReference)}`);
    }
}

export declare namespace ZodObjectNode {
    interface Args {
        fields: {
            name: string;
            value: ts.AstNode;
        }[];
    }
}

export class ZodObjectNode extends ts.AstNode {
    public constructor(private readonly args: ZodObjectNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.write("z.object({");
        writer.newLine();
        writer.indent();
        for (const field of this.args.fields) {
            writer.write(`${field.name}: `);
            writer.writeNode(field.value);
            writer.write(",");
            writer.newLine();
        }
        writer.dedent();
        writer.write("})");
    }
}
