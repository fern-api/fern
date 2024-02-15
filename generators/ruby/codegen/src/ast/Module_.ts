import { FernFilepath } from "@fern-fern/ir-sdk/api";
import { BLOCK_END } from "../utils/RubyConstants";
import { ClassReference } from "./classes/ClassReference";
import { Class_ } from "./classes/Class_";
import { AstNode } from "./core/AstNode";
import { Import } from "./Import";

export declare namespace Module_ {
    export interface Init extends AstNode.Init {
        name: string;
        child?: Module_ | Class_ | AstNode | AstNode[];
        arbitraryImports?: Import[];
    }
}

export class Module_ extends AstNode {
    public name: string;
    public children?: AstNode[];
    public arbitraryImports?: Import[];

    constructor({ name, child, arbitraryImports, ...rest }: Module_.Init) {
        super(rest);
        this.name = name;
        this.children = child instanceof AstNode ? [child] : child;
        this.arbitraryImports = arbitraryImports;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.name, templateString: "module %s", startingTabSpaces });
        this.children?.forEach((child) =>
            this.addText({ stringContent: child.write({ startingTabSpaces: this.tabSizeSpaces + startingTabSpaces }) })
        );
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    static wrapInModules<T extends AstNode | AstNode[]>(
        rootModule: string,
        child: T,
        path?: FernFilepath,
        arbitraryImports?: Import[],
        includeFilename = true
    ): Module_ | Class_ | T {
        const moduleBreadcrumbs = path ? Module_.getModulePathFromTypeName(path) : [];
        const classWrapper = path ? Module_.getClassPathFromTypeName(path) : undefined;
        let moduleWrappedItem: Module_ | Class_ | T = child;
        if (classWrapper !== undefined && includeFilename) {
            moduleWrappedItem = new Class_({
                classReference: new ClassReference({ name: classWrapper }),
                includeInitializer: false,
                children: child
            });
        }
        [rootModule, ...moduleBreadcrumbs].reverse().forEach(
            (mod) =>
                (moduleWrappedItem = new Module_({
                    name: mod,
                    child: moduleWrappedItem,
                    writeImports: rootModule === mod,
                    arbitraryImports: rootModule === mod ? arbitraryImports : undefined
                }))
        );

        return moduleWrappedItem;
    }

    static getModuleBreadcrumbs(path: FernFilepath, includeFilename: boolean): string[] {
        const modulePath = Module_.getModulePathFromTypeName(path);
        const classPath = Module_.getClassPathFromTypeName(path);
        return includeFilename && classPath !== undefined ? modulePath.concat([classPath]) : modulePath;
    }

    static getModulePathFromTypeName(path: FernFilepath): string[] {
        return path.packagePath.map((pathSegment) => pathSegment.pascalCase.safeName);
    }

    static getClassPathFromTypeName(path: FernFilepath): string | undefined {
        return path.file?.pascalCase.safeName;
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>(this.arbitraryImports);
        this.children?.forEach((c) => (imports = new Set([...imports, ...c.getImports()])));
        return imports;
    }
}
