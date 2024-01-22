import { AstNode } from "./core/AstNode";

export declare namespace Import {
    export interface Init {
        from: string;
        isExternal?: boolean;
    }
}
export class Import extends AstNode {
    public from: string;
    public isExternal: boolean;

    constructor({ from, isExternal = false }: Import.Init) {
        super({});
        this.from = from;
        this.isExternal = isExternal;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({
            stringContent: this.from,
            templateString: this.isExternal ? 'require "%s"' : 'require_relative "%s"',
            startingTabSpaces
        });
    }
}
