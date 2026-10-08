import { Access } from "./Access.js";
import { Attribute } from "./Attribute.js";
import { CodeBlock } from "./CodeBlock.js";
import { Comment } from "./Comment.js";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { Type } from "./Type.js";
import { convertToPhpVariableName } from "./utils/convertToPhpVariableName.js";

export declare namespace Field {
    export interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* The access level of the method */
        access: Access;
        /* Whether the the field is a readonly value */
        readonly_?: boolean;
        /* The initializer for the field */
        initializer?: CodeBlock;
        /* The docs (used for describing the field) */
        docs?: string;
        /* Docs included in-line */
        inlineDocs?: string;
        /* Field attributes */
        attributes?: Attribute[];
        /* Indicates that this field is inherited and should not be written to the class. */
        inherited?: boolean;
        /* The type documented for this field's key in a data class constructor's `$values` array; defaults to `type` */
        constructorType?: Type;
        /* Wraps the raw constructor value (`$values['key'] ?? <default>`) before it is assigned to the field */
        constructorValueWrapper?: (rawValue: CodeBlock) => CodeBlock;
    }
}

export class Field extends AstNode {
    public readonly name: string;
    public readonly type: Type;
    public readonly access: Access;
    private readonly_: boolean;
    public readonly initializer: CodeBlock | undefined;
    public readonly docs: string | undefined;
    private inlineDocs: string | undefined;
    private attributes: Attribute[];
    public readonly inherited: boolean;
    public readonly constructorType: Type | undefined;
    public readonly constructorValueWrapper: ((rawValue: CodeBlock) => CodeBlock) | undefined;

    constructor({
        name,
        type,
        access,
        readonly_,
        initializer,
        docs,
        inlineDocs,
        attributes,
        inherited,
        constructorType,
        constructorValueWrapper
    }: Field.Args) {
        super();
        this.name = convertToPhpVariableName(name);
        this.type = type;
        this.access = access;
        this.readonly_ = readonly_ ?? false;
        this.initializer = initializer;
        this.docs = docs;
        this.inlineDocs = inlineDocs;
        this.attributes = attributes ?? [];
        this.inherited = inherited ?? false;
        this.constructorType = constructorType;
        this.constructorValueWrapper = constructorValueWrapper;
    }

    public write(writer: Writer): void {
        this.writeComment(writer);
        this.writeAttributesIfPresent(writer);

        writer.write(`${this.access} `);
        if (this.readonly_) {
            writer.write("readonly ");
        }

        this.type.write(writer);
        writer.write(` ${this.name}`);

        if (this.initializer != null) {
            writer.write(" = ");
            this.initializer.write(writer);
        }
        writer.write(";");

        if (this.inlineDocs != null) {
            writer.write(` // ${this.inlineDocs}`);
        }
        writer.newLine();
    }

    private writeComment(writer: Writer): void {
        const comment = new Comment();
        comment.addTag({
            tagType: "var",
            type: this.type,
            name: this.name,
            docs: this.docs
        });
        comment.write(writer);
    }

    private writeAttributesIfPresent(writer: Writer): void {
        if (this.attributes.length > 0) {
            writer.write("#[");
            this.attributes.forEach((attribute, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                attribute.write(writer);
            });
            writer.writeLine("]");
        }
    }
}
