import { ts } from "@fern-api/typescript-ast";

import { PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

export function typeReferenceMapper(typeReference: TypeReference) {
    return typeReference._visit<string>({
        container: () => "unknown()",
        named: () => "unknown()",
        primitive: (value) => primitiveTypeV1Mapper(value.v1),
        unknown: () => "unknown()",
        _other: () => "any()"
    });
}

export function primitiveTypeV1Mapper(primitiveTypeV1: PrimitiveTypeV1) {
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
        let exports;
        switch (this.args.importFrom.type) {
            case "default":
                exports = `{ default as ${this.args.name} }`;
                break;
            case "star":
                exports = `{ * as ${this.args.name} }`;
                break;
            case "named":
                exports = this.args.name;
                break;
        }
        writer.write(`export ${exports} from "./${this.args.importFrom.moduleName}"`);
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
