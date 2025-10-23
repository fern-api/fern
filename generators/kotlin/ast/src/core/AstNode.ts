import { Writer } from "../Writer";

export interface AstNode {
    write(writer: Writer): void;
}
