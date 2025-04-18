import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { AttrPath, ModulePath } from "./core/types";

export declare namespace Reference {
    interface Args {
        /* The name of the reference */
        name: string;
        /* The module path of the reference
            For example:
            - "foo.bar" -> ["foo", "bar"]
            - "foo.bar.baz" -> ["foo", "bar", "baz"]
        */
        modulePath?: ModulePath;
        /* The generic types of the reference */
        genericTypes?: AstNode[];
        /* The alias of the reference */
        alias?: string;
        /* The path to the attribute of the reference */
        attribute?: AttrPath;
    }
}

export class Reference extends AstNode {
    public readonly name: string;
    public readonly modulePath: ModulePath;
    public readonly genericTypes: AstNode[];
    public readonly alias: string | undefined;
    public readonly attribute: AttrPath;

    constructor({ name, modulePath, genericTypes, alias, attribute }: Reference.Args) {
        super();
        this.name = name;
        this.modulePath = modulePath ?? [];
        this.genericTypes = genericTypes ?? [];
        this.alias = alias;
        this.attribute = attribute ?? [];
        this.references.push(this);

        this.genericTypes.forEach((genericType) => {
            this.inheritReferences(genericType);
        });
    }

    public write(writer: Writer): void {
        const nameOverride = writer.getRefNameOverride(this);
        writer.write(nameOverride.name);

        if (this.genericTypes.length > 0) {
            writer.write("[");
            this.genericTypes.forEach((genericType, index) => {
                if (index > 0) {
                    writer.write(", ");
                }
                genericType.write(writer);
            });
            writer.write("]");
        }

        if (this.attribute.length > 0) {
            writer.write(".");
            this.attribute.forEach((attr, index) => {
                if (index > 0) {
                    writer.write(".");
                }
                writer.write(attr);
            });
        }
    }

    public getFullyQualifiedPath(): string {
        return this.modulePath.join(".");
    }

    public getFullyQualifiedModulePath(): string {
        return `${this.getFullyQualifiedPath()}.${this.name}`;
    }
}
