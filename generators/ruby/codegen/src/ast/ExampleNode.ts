import { AstNode } from "./core/AstNode";
import { Import } from "./Import";

export declare namespace ExampleNode {
    export interface Init extends AstNode.Init {
        children: (AstNode | string)[];
    }
}

export class ExampleNode extends AstNode {
    private children: (AstNode | string)[];
    constructor({ children, ...rest }: ExampleNode.Init) {
        super({ ...rest, writeImports: true });
        this.children = children;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.children.forEach((child) =>
            this.addText({ stringContent: child instanceof AstNode ? child.write({ startingTabSpaces }) : child })
        );
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        this.children?.forEach((c) => {
            if (c instanceof AstNode) {
                imports = new Set([...imports, ...c.getImports()]);
            }
        });
        return imports;
    }
}
