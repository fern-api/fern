import { DeclaredTypeName } from "@fern-fern/ir-sdk/api";
import { AstNode } from "./AstNode";
import { Class_ } from "./Class_";

export declare namespace Module_ {
    export interface Init extends AstNode.Init {
        name: string;
        child?: Module_ | Class_ | AstNode;
    }
}

export class Module_ extends AstNode {
    public name: string;
    public child?: Module_ | Class_ | AstNode;

    constructor({ name, ...rest }: Module_.Init) {
        super(rest);
        this.name = name;
    }

    public writeInternal(startingTabSpaces: number): string {
        // Write modules shell `module NAME ... end`
        return this.writePaddedString(
            startingTabSpaces,
            `
module ${this.name}
${this.child?.writeInternal(this.tabSizeSpaces + startingTabSpaces)}
end
`
        );
    }

    static wrapInModules<T extends AstNode>(childName: DeclaredTypeName, child: T): Module_ | T {
        const moduleBreadcrumbs = childName.fernFilepath.packagePath.map(
            (pathSegment) => pathSegment.snakeCase.safeName
        );
        let moduleWrappedItem: Module_ | T = child;
        moduleBreadcrumbs.forEach((mod) => (moduleWrappedItem = new Module_({ name: mod, child: moduleWrappedItem })));

        return moduleWrappedItem;
    }
}
