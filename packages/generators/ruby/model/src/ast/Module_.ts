import { DeclaredTypeName } from "@fern-fern/ir-sdk/api";
import { BLOCK_END } from "../utils/Constants";
import { Class_ } from "./classes/Class_";
import { AstNode } from "./core/AstNode";
import { Import } from "./Import";

export declare namespace Module_ {
    export interface Init extends AstNode.Init {
        name: string;
        child?: Module_ | Class_ | AstNode | AstNode[];
    }
}

export class Module_ extends AstNode {
    public name: string;
    public children?: AstNode[];

    constructor({ name, child, ...rest }: Module_.Init) {
        super(rest);
        this.name = name;
        this.children = child instanceof AstNode ? [child] : child;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.name, templateString: "module %s", startingTabSpaces });
        this.children?.forEach((child) =>
            this.addText({ stringContent: child.write(this.tabSizeSpaces + startingTabSpaces) })
        );
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    // TODO: make this take into account the core client name
    static wrapInModules<T extends AstNode>(rootModule: string, childName: DeclaredTypeName, child: T): Module_ | T {
        const moduleBreadcrumbs = Module_.getModulePathFromTypeName(childName);
        let moduleWrappedItem: Module_ | T = child;
        [rootModule, ...moduleBreadcrumbs].reverse().forEach(
            (mod) =>
                (moduleWrappedItem = new Module_({
                    name: mod,
                    child: moduleWrappedItem,
                    writeImports: rootModule === mod
                }))
        );

        return moduleWrappedItem;
    }

    static getModulePathFromTypeName(typeName: DeclaredTypeName): string[] {
        return typeName.fernFilepath.allParts.map((pathSegment) => pathSegment.pascalCase.safeName);
    }

    public getImports(): Set<Import> {
        const imports = new Set<Import>();
        this.children?.forEach((c) => new Set([...imports, ...c.getImports()]));
        return imports;
    }
}
