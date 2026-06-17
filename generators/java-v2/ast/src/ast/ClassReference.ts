import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";

export declare namespace ClassReference {
    interface Args {
        /* The name of the Java class */
        name: string;
        /* The package name of the Java class */
        packageName: string;
        /* Force the class reference to be fully qualified */
        fullyQualified?: boolean;
        /**
         * The chain of enclosing classes (outermost first) when this is a nested class,
         * not including `name`. For example, the nested class `PostRootRequest.Bar` has
         * `name: "Bar"` and `enclosingClasses: ["PostRootRequest"]`. Only the outermost
         * enclosing class is imported; the reference is written using the dotted path.
         */
        enclosingClasses?: string[];
    }
}

export class ClassReference extends AstNode {
    public readonly name: string;
    public readonly packageName: string;
    public readonly fullyQualified: boolean;
    public readonly enclosingClasses: string[];

    constructor({ name, packageName, fullyQualified, enclosingClasses }: ClassReference.Args) {
        super();
        this.name = name;
        this.packageName = packageName;
        this.fullyQualified = fullyQualified ?? false;
        this.enclosingClasses = enclosingClasses ?? [];
    }

    public write(writer: Writer): void {
        const topLevelClassName = this.enclosingClasses[0] ?? this.name;
        const qualifiedName = [...this.enclosingClasses, this.name].join(".");
        writer.addImport(`${this.packageName}.${topLevelClassName}`);
        if (this.fullyQualified) {
            writer.write(`${this.packageName}.${qualifiedName}`);
            return;
        }
        writer.write(qualifiedName);
    }
}
