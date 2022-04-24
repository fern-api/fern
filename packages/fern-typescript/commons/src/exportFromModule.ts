import path from "path";
import { Directory } from "ts-morph";

export declare namespace exportFromModule {
    export interface Args {
        module: Directory;
        pathToExport: string;
    }
}

export function exportFromModule({ module, pathToExport }: exportFromModule.Args): void {
    const indexTsFilepath = path.join(module.getPath(), "index.ts");
    const indexTs = module.getSourceFile(indexTsFilepath) ?? module.createSourceFile(indexTsFilepath);
    indexTs.addExportDeclaration({
        moduleSpecifier: module.getRelativePathAsModuleSpecifierTo(pathToExport),
    });
}
