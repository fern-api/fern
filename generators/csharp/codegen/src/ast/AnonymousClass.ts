import { AstNode, CodeBlock } from "../csharp";
import { Writer } from "./core/Writer";

export declare namespace AnonymousClass {
    interface Args {
        properties: Properties;
    }

    type Properties = (NamedProperty | UnnamedProperty)[];

    interface NamedProperty {
        name: string;
        assignment: CodeBlock;
    }
    // If you a property of antother object and want to retain that property name, you don't need to provide
    // the property name
    type UnnamedProperty = CodeBlock;
}

export class AnonymousClass extends AstNode {
    private readonly properties: (AnonymousClass.NamedProperty | AnonymousClass.UnnamedProperty)[];

    constructor({ properties }: AnonymousClass.Args) {
        super();
        this.properties = properties;
    }

    public write(writer: Writer): void {
        writer.writeLine("new");
        writer.writeLine("{");
        writer.indent();
        this.properties.forEach((property, index) => {
            if (index > 0) {
                writer.write(",");
            }
            if (isNamedProperty(property)) {
                writer.write(`${property.name} =`);
                writer.writeNode(property.assignment);
            } else {
                writer.writeNode(property);
            }
        });
        writer.dedent();
        writer.writeLine("}");
    }
}

function isNamedProperty(
    argument: AnonymousClass.NamedProperty | AnonymousClass.UnnamedProperty
): argument is AnonymousClass.NamedProperty {
    return (argument as AnonymousClass.NamedProperty)?.name != null;
}
