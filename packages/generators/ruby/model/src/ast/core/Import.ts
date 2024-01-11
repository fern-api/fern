import { AstNode } from "../AstNode";


export class Import extends AstNode {
    public from: string;

    constructor(from: string) {
        super();
        this.from = from;
    }

    public writeInternal(startingTabSpaces: number): string {
        return this.writePaddedString(startingTabSpaces, `require "${this.from}"`);
    }
}