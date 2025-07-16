import { AbsoluteFilePath, RelativeFilePath, join, relative } from "@fern-api/fs-utils";

import { AstNode } from "./core/AstNode";

export declare namespace Import {
    export interface Init extends AstNode.Init {
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

    public writeRelative(startingTabSpaces: number, startingLocation: AbsoluteFilePath): string {
        const importDirective = relative(startingLocation, AbsoluteFilePath.of("/" + this.from));
        this.addText({
            stringContent: this.isExternal ? this.from : importDirective,
            templateString: this.isExternal ? 'require "%s"' : 'require_relative "%s"',
            startingTabSpaces
        });
        const text = this.text.join("\n");
        this.text = [];
        return text;
    }

    public writeAbsolute(startingTabSpaces: number, pathPrefix: RelativeFilePath): string {
        const importDirective = join(pathPrefix, RelativeFilePath.of(this.from));
        this.addText({
            stringContent: this.isExternal ? this.from : importDirective,
            templateString: this.isExternal ? 'require "%s"' : 'require_relative "%s"',
            startingTabSpaces
        });
        const text = this.text.join("\n");
        this.text = [];
        return text;
    }
}
