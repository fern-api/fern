import { Import } from "./Import";
import { AstNode } from "./core/AstNode";

export declare namespace ExampleNode {
    export interface Init extends AstNode.Init {
        children: (AstNode | string)[];
        arbitraryImports?: Import[];
    }
}

export class ExampleNode extends AstNode {
    private children: (AstNode | string)[];
    public arbitraryImports?: Import[];

    constructor({ children, arbitraryImports, ...rest }: ExampleNode.Init) {
        super({ ...rest, writeImports: true });
        this.children = children;
        this.arbitraryImports = arbitraryImports;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.children.forEach((child) =>
            this.addText({ stringContent: child instanceof AstNode ? child.write({ startingTabSpaces }) : child })
        );
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>(this.arbitraryImports);
        this.children?.forEach((c) => {
            if (c instanceof AstNode) {
                imports = new Set([...imports, ...c.getImports()]);
            }
        });
        return imports;
    }
}
