import { Writer } from "./Writer";

export interface FormattedAstNodeSnippet {
    imports: string | undefined;
    body: string;
}

export abstract class AstNode {
    /**
     * Every AST node knows how to write itself to a string.
     */
    public abstract write(writer: Writer): void;
}
