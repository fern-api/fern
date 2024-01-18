import { DeclaredTypeName } from "@fern-fern/ir-sdk/api";
import { BLOCK_END } from "../utils/Constants";
import { Class_ } from "./classes/Class_";
import { AstNode } from "./core/AstNode";
import { Import } from "./Import";

export declare namespace Module_ {
    export interface Init extends AstNode.Init {
        name: string;
        child?: Module_ | Class_ | AstNode;
        isOuterModule?: boolean;
    }
}

export class Module_ extends AstNode {
    public name: string;
    public child?: AstNode;
    private isOuterModule: boolean;

    constructor({ name, child, isOuterModule = true, ...rest }: Module_.Init) {
        super(rest);
        this.name = name;
        this.child = child;
        this.isOuterModule = isOuterModule;
    }

    public writeInternal(startingTabSpaces: number): void {
        if (this.isOuterModule) {
            this.getImports().forEach((i) =>
                this.addText({ stringContent: i.write(startingTabSpaces), startingTabSpaces })
            );
            this.addNewLine();
        }
        this.addText({ stringContent: this.name, templateString: "module %s", startingTabSpaces });
        this.addText({ stringContent: this.child?.write(this.tabSizeSpaces + startingTabSpaces) });
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
                    isOuterModule: rootModule === mod
                }))
        );

        return moduleWrappedItem;
    }

    static getModulePathFromTypeName(typeName: DeclaredTypeName): string[] {
        return typeName.fernFilepath.allParts.map((pathSegment) => pathSegment.pascalCase.safeName);
    }

    public getImports(): Set<Import> {
        return this.child?.getImports() ?? new Set();
    }
}
