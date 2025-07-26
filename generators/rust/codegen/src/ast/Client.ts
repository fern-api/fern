import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

/**
 * Simple Client AST component - minimal Rust client generation
 * Generates only what's actually needed, no bloat
 */
export declare namespace Client {
    interface Args {
        name: string;
        fields?: Field[];        // ← All struct fields passed from outside
        constructors?: SimpleMethod[]; // ← All constructors passed from outside
        methods?: SimpleMethod[];      // ← All methods passed from outside
    }

    interface Field {
        name: string;
        type: string;
        visibility: 'pub' | 'private';
    }

    interface SimpleMethod {
        name: string;
        parameters?: string[];
        returnType?: string;
        isAsync?: boolean;
        body?: string;
    }
}

export class Client extends AstNode {
    public readonly name: string;
    public readonly fields: Client.Field[];
    public readonly constructors: Client.SimpleMethod[];
    public readonly methods: Client.SimpleMethod[];

    public constructor({ name, fields = [], constructors = [], methods = [] }: Client.Args) {
        super();
        this.name = name;
        this.fields = fields;
        this.constructors = constructors;
        this.methods = methods;
    }

    public write(writer: Writer): void {
        // Generate struct
        this.writeStruct(writer);
        writer.newLine();

        // Generate impl
        this.writeImpl(writer);
    }

    private writeStruct(writer: Writer): void {
        writer.write(`pub struct ${this.name} {`);
        writer.newLine();
        writer.indent();

        // Just render whatever fields were passed in (like Swift pattern)
        this.fields.forEach((field) => {
            writer.write(`${field.visibility} ${field.name}: ${field.type},`);
            writer.newLine();
        });

        writer.dedent();
        writer.write("}");
        writer.newLine();
    }

    private writeImpl(writer: Writer): void {
        writer.write(`impl ${this.name} {`);
        writer.newLine();
        writer.indent();

        // Render constructors (like Swift pattern)
        this.constructors.forEach((constructor) => {
            this.writeMethod(writer, constructor);
            writer.newLine();
        });

        // Render methods (like Swift pattern)
        this.methods.forEach((method) => {
            this.writeMethod(writer, method);
            writer.newLine();
        });

        writer.dedent();
        writer.write("}");
        writer.newLine();
    }

    private writeMethod(writer: Writer, method: Client.SimpleMethod): void {
        const params = method.parameters?.join(", ") || "";
        const returnType = method.returnType || "String";
        const asyncKeyword = method.isAsync ? "async " : "";

        // Don't add &self for constructors
        const selfParam = method.name === "new" ? "" : "&self";
        const allParams = selfParam && params ? `${selfParam}, ${params}` : selfParam + params;

        writer.write(`pub ${asyncKeyword}fn ${method.name}(${allParams}) -> ${returnType} {`);
        writer.newLine();
        writer.indent();

        if (method.body) {
            // Use provided method body implementation
            writer.write(method.body.toString());
        } else {
            // Default fallback
            writer.write('todo!("Implement API call")');
        }

        writer.newLine();
        writer.dedent();
        writer.write("}");
        writer.newLine();
    }
}
