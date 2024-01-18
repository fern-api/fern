import { AstNode } from "./core/AstNode";

export declare namespace Import {
    export interface Init {
        from: string;
    }
}
export class Import extends AstNode {
    public from: string;

    constructor({ from }: Import.Init) {
        super({});
        this.from = from;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.from, templateString: 'require "%s"', startingTabSpaces });
    }
}
