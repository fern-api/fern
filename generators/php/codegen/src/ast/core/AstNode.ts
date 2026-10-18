import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator";

import { BasePhpCustomConfigSchema } from "../../custom-config/BasePhpCustomConfigSchema.js";
import { Writer } from "./Writer.js";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public toString(param: {
        namespace: string;
        rootNamespace: string;
        customConfig: BasePhpCustomConfigSchema;
        skipImports?: boolean;
    }): string {
        if (param == null) {
            // You are likely implicitly calling toString() inside a string interpolation or concatenation.
            // Don't do this:
            //  - astNode.toString()
            //  - `${astNode}`
            //  - "Foo<" + astNode + ">"

            throw new Error("Internal error; AstNode.toString method called incorrectly.");
        }
        const { namespace, rootNamespace, customConfig, skipImports = false } = param;

        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        return writer.toString(skipImports);
    }

    /**
     * Renders the node body separately from the `use ...;` block it references. This is the PHP
     * analogue of the TypeScript AST's `toStringWithoutImports` (and the C# AST's
     * `toStringWithoutImports` / the Java AST's `renderNodeWithoutImports`): `code` is the node's
     * rendered body with no `namespace ...;` header and no leading `use` block, and `imports` is
     * the rendered `use ...;` block the body would otherwise need (empty string when none).
     *
     * A single write pass populates the writer's references, so `code` and `imports` are computed
     * from the same render — exactly the split `toString` performs internally when prepending the
     * `use` block. This lets callers embed an invocation inside code they already own (e.g. a
     * documentation code template) while surfacing the `use` statements the call requires.
     */
    public toStringWithoutImports({
        namespace,
        rootNamespace,
        customConfig
    }: {
        namespace: string;
        rootNamespace: string;
        customConfig: BasePhpCustomConfigSchema;
    }): { code: string; imports: string } {
        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        return {
            // `toString(true)` returns only the buffer (skipping the `namespace`/`use` block).
            code: writer.toString(true),
            imports: writer.importsToString()
        };
    }

    /**
     * Writes the node to a string.
     */
    public async toStringAsync({
        namespace,
        rootNamespace,
        customConfig
    }: {
        namespace: string;
        rootNamespace: string;
        customConfig: BasePhpCustomConfigSchema;
    }): Promise<string> {
        const writer = new Writer({
            namespace,
            rootNamespace,
            customConfig
        });
        this.write(writer);
        return writer.toString();
    }
}
