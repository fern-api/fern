import { AstNode } from "@fern-api/rust-codegen";

export class RustFileBuilder {
    private imports: string[] = [];
    private items: AstNode[] = [];

    public addUse(path: string, items?: string[]): this {
        if (items && items.length > 0) {
            this.imports.push(`use ${path}::{${items.join(", ")}};`);
        } else {
            this.imports.push(`use ${path};`);
        }
        return this;
    }

    public addItem(item: AstNode): this {
        this.items.push(item);
        return this;
    }

    public addItems(...items: AstNode[]): this {
        this.items.push(...items);
        return this;
    }

    public addRawCode(code: string): this {
        // For now, we'll add raw code as a simple wrapper
        const rawNode = new (class extends AstNode {
            public write(writer: any): void {
                writer.write(code);
            }
        })();
        this.items.push(rawNode);
        return this;
    }

    public build(): string {
        const parts: string[] = [];

        // Add imports
        if (this.imports.length > 0) {
            parts.push(this.imports.join("\n"));
            parts.push(""); // Empty line after imports
        }

        // Add items
        const itemStrings = this.items.map(item => item.toString());
        parts.push(...itemStrings);

        return parts.join("\n");
    }

    // Convenience methods for common imports
    public addStandardErrorImports(): this {
        return this.addUse("thiserror", ["Error"])
            .addUse("serde", ["Deserialize", "Serialize"]);
    }

    public addStandardClientImports(): this {
        return this.addUse("reqwest")
            .addUse("serde_json");
    }
} 