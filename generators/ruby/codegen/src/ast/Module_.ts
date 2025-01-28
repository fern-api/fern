import { FernFilepath } from "@fern-fern/ir-sdk/api";

import { LocationGenerator } from "../utils/LocationGenerator";
import { BLOCK_END } from "../utils/RubyConstants";
import { Import } from "./Import";
import { ClassReference } from "./classes/ClassReference";
import { Class_ } from "./classes/Class_";
import { AstNode } from "./core/AstNode";

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

    static wrapInModules<T extends AstNode | AstNode[]>({
        locationGenerator,
        child,
        path,
        arbitraryImports,
        includeFilename = true,
        isType
    }: {
        locationGenerator: LocationGenerator;
        child: T;
        path?: FernFilepath;
        arbitraryImports?: Import[];
        includeFilename?: boolean;
        isType?: boolean;
    }): Module_ | Class_ | T {
        let moduleWrappedItem: Module_ | Class_ | T = child;
        let moduleBreadcrumbs: string[] = [locationGenerator.rootModule];
        if (path) {
            moduleBreadcrumbs = locationGenerator.getModuleBreadcrumbs({ path, includeFilename, isType });
        }
        // if (path) {
        //     if (!locationGenerator.shouldFlattenModules) {
        //         moduleBreadcrumbs = moduleBreadcrumbs.concat(locationGenerator.getModulePathFromTypeName(path));
        //         const classWrapper = locationGenerator.getClassPathFromTypeName(path);

        //         if (classWrapper !== undefined && includeFilename) {
        //             moduleWrappedItem = new Class_({
        //                 classReference: new ClassReference({ name: classWrapper }),
        //                 includeInitializer: false,
        //                 children: child
        //             });
        //         }
        //     } else {
        //         moduleBreadcrumbs = locationGenerator.getModuleBreadcrumbs({ path, includeFilename, isType });
        //     }
        // }

        moduleBreadcrumbs.reverse().forEach(
            (mod) =>
                (moduleWrappedItem = new Module_({
                    name: mod,
                    child: moduleWrappedItem,
                    writeImports: locationGenerator.rootModule === mod,
                    arbitraryImports: locationGenerator.rootModule === mod ? arbitraryImports : undefined
                }))
        );

        return moduleWrappedItem;
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>(this.arbitraryImports);
        this.children?.forEach((c) => (imports = new Set([...imports, ...c.getImports()])));
        return imports;
    }
}
