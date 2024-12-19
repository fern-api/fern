import { AbstractAstNode } from "@fern-api/browser-compatible-base-generator";
import { Writer } from "./Writer";
import * as prettier from "prettier";

export abstract class AstNode extends AbstractAstNode {
    /**
     * Writes the node to a string.
     */
    public async toStringAsync(): Promise<string> {
        const writer = new Writer();
        this.write(writer);
        return writer.toString();
    }

    public toString(): string {
        const writer = new Writer();
        this.write(writer);
        return writer.toString();
    }

    public toStringFormatted(): string {
        return prettier.format(this.toString(), { parser: "typescript", tabWidth: 4, printWidth: 120 });
    }

    public toStringFormattedAsync(): Promise<string> {
        return Promise.resolve(
            prettier.format(this.toString(), { parser: "typescript", tabWidth: 4, printWidth: 120 })
        );
    }
}
