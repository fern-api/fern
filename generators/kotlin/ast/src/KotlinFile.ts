import { AstNode } from "./core/AstNode";
import { Package } from "./Package";
import { Import } from "./Import";
import { Writer } from "./Writer";
import { Class } from "./Class";
import { DataClass } from "./DataClass";
import { Interface } from "./Interface";
import { Enum } from "./Enum";
import { SealedClass } from "./SealedClass";
import { Function } from "./Function";
import { Property } from "./Property";
import { Comment } from "./Comment";

export interface KotlinFileArgs {
    packageName: string;
    imports?: Import[];
    classes?: (Class | DataClass | Interface | Enum | SealedClass)[];
    functions?: Function[];
    properties?: Property[];
    fileComment?: string;
}

export class KotlinFile implements AstNode {
    public readonly packageName: string;
    public readonly imports: Import[];
    public readonly classes: (Class | DataClass | Interface | Enum | SealedClass)[];
    public readonly functions: Function[];
    public readonly properties: Property[];
    public readonly fileComment?: string;

    constructor({
        packageName,
        imports = [],
        classes = [],
        functions = [],
        properties = [],
        fileComment
    }: KotlinFileArgs) {
        this.packageName = packageName;
        this.imports = imports;
        this.classes = classes;
        this.functions = functions;
        this.properties = properties;
        this.fileComment = fileComment;
    }

    public write(writer: Writer): void {
        if (this.fileComment != null) {
            Comment.docs(this.fileComment).write(writer);
            writer.newLine();
        }

        new Package(this.packageName).write(writer);
        writer.newLine();
        writer.newLine();

        if (this.imports.length > 0) {
            this.imports.forEach((imp) => {
                imp.write(writer);
                writer.newLine();
            });
            writer.newLine();
        }

        this.properties.forEach((property, index) => {
            if (index > 0) {
                writer.newLine();
            }
            property.write(writer);
            writer.newLine();
        });

        if (this.properties.length > 0 && (this.functions.length > 0 || this.classes.length > 0)) {
            writer.newLine();
        }

        this.functions.forEach((func, index) => {
            if (index > 0) {
                writer.newLine();
            }
            func.write(writer);
            writer.newLine();
        });

        if (this.functions.length > 0 && this.classes.length > 0) {
            writer.newLine();
        }

        this.classes.forEach((cls, index) => {
            if (index > 0) {
                writer.newLine();
            }
            cls.write(writer);
            writer.newLine();
        });
    }

    public toString(): string {
        const writer = new Writer();
        this.write(writer);
        return writer.toString();
    }
}
