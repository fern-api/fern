import { ts } from "@fern-api/typescript-ast";

import { PrimitiveTypeV1, SingleUnionType, TypeReference } from "@fern-fern/ir-sdk/api";

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

// TODO: finish implementing this
export function singleUnionTypeMapper(singleUnionType: SingleUnionType) {
    return singleUnionType.shape._visit({
        samePropertiesAsObject: (value) => "unknown()",
        singleProperty: (value) => "unknown()",
        noProperties: () => "unknown()",
        _other: (value) => "any()"
    });
}

// TODO: finish implementing this
export function typeReferenceMapper(typeReference: TypeReference) {
    return typeReference._visit({
        container: (value) => "unknown()",
        named: (value) => "unknown()",
        primitive: (value) => primitiveTypeV1Mapper(value.v1),
        unknown: () => "unknown()",
        _other: (value) => "any()"
    });
}

export declare namespace ExportNode {
    interface Args {
        initializer: ts.AstNode;
        default?: boolean;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ExportNode extends ts.AstNode {
    public constructor(private readonly args: ExportNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        if (this.args.default) {
            writer.write("export default ");
        } else {
            writer.write("export ");
        }
        writer.writeNode(this.args.initializer);
    }
}

export declare namespace ReExportAsNamedNode {
    interface Args {
        name: string;
        importFrom: ts.Reference.ModuleImport;
    }
}

// TODO: generalize and move into @fern-api/typescript-ast
export class ReExportAsNamedNode extends ts.AstNode {
    public constructor(private readonly args: ReExportAsNamedNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(
            new ExportNode({
                initializer: ts.codeblock((writer) => {
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
                    // TODO: re-write to support non-relative imports
                    // SEE: https://github.com/fern-api/fern/pull/7121#discussion_r2095771293
                    writer.write(` from "./${this.args.importFrom.moduleName}"`);
                })
            })
        );
    }
}
