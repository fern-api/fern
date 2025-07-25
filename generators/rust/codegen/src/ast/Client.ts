import { AstNode } from "./AstNode";
import { Writer } from "./Writer";

/**
 * Simple Client AST component - minimal Rust client generation
 * Generates only what's actually needed, no bloat
 */
export declare namespace Client {
    interface Args {
        name: string;
        isRoot?: boolean;
        subClients?: string[]; // Just names, keep it simple
        methods?: SimpleMethod[];
    }

    interface SimpleMethod {
        name: string;
        parameters?: string[];
        returnType?: string;
    }
}

export class Client extends AstNode {
    public readonly name: string;
    public readonly isRoot: boolean;
    public readonly subClients: string[];
    public readonly methods: Client.SimpleMethod[];

    public constructor({
        name,
        isRoot = false,
        subClients = [],
        methods = []
    }: Client.Args) {
        super();
        this.name = name;
        this.isRoot = isRoot;
        this.subClients = subClients;
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
        
        if (this.isRoot) {
            // Root client has sub-clients as fields
            this.subClients.forEach(subClient => {
                writer.write(`pub ${subClient.toLowerCase()}: ${subClient},`);
                writer.newLine();
            });
        }
        // Sub-clients are empty structs for now
        
        writer.dedent();
        writer.write("}");
        writer.newLine();
    }

    private writeImpl(writer: Writer): void {
        writer.write(`impl ${this.name} {`);
        writer.newLine();
        writer.indent();
        
        // Constructor
        writer.write("pub fn new() -> Self {");
        writer.newLine();
        writer.indent();
        
        if (this.isRoot) {
            writer.write("Self {");
            writer.newLine();
            writer.indent();
            this.subClients.forEach(subClient => {
                writer.write(`${subClient.toLowerCase()}: ${subClient}::new(),`);
                writer.newLine();
            });
            writer.dedent();
            writer.write("}");
        } else {
            writer.write("Self");
        }
        
        writer.newLine();
        writer.dedent();
        writer.write("}");
        writer.newLine();
        
        // Methods
        this.methods.forEach(method => {
            writer.newLine();
            this.writeMethod(writer, method);
        });
        
        writer.dedent();
        writer.write("}");
        writer.newLine();
    }

    private writeMethod(writer: Writer, method: Client.SimpleMethod): void {
        const params = method.parameters?.join(", ") || "";
        const returnType = method.returnType || "String";
        
        writer.write(`pub fn ${method.name}(&self${params ? ", " + params : ""}) -> ${returnType} {`);
        writer.newLine();
        writer.indent();
        writer.write('todo!("Implement API call")');
        writer.newLine();
        writer.dedent();
        writer.write("}");
        writer.newLine();
    }
} 