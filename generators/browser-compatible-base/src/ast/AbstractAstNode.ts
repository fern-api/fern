import { tag } from "../utils/stacktrace";
import { AbstractWriter } from "./AbstractWriter";

export abstract class AbstractAstNode {
    /**
     * Every AST node knows how to write itself to a string.
     */
    public abstract write(writer: AbstractWriter): void;

    public constructor() {
        // when FERN_STACK_TRACK is defined this will track the stack trace of the current AstNode.
        // otherwise this has absolutely no effect whatsoever.
        tag(this);
    }
}
