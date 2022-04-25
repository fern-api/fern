import path from "path";
import { Directory } from "ts-morph";

export declare namespace exportFromModule {
    export interface Args {
        module: Directory;
        pathToExport: string;
        namespaceExport?: string;
    }
}

export function exportFromModule({ module, pathToExport, namespaceExport }: exportFromModule.Args): void {
    const indexTsFilepath = path.join(module.getPath(), "index.ts");
    const indexTs = module.getSourceFile(indexTsFilepath) ?? module.createSourceFile(indexTsFilepath);
    const moduleSpecifier = module.getRelativePathAsModuleSpecifierTo(pathToExport);
    if (indexTs.getExportDeclaration(moduleSpecifier) == null) {
        indexTs.addExportDeclaration({
            moduleSpecifier,
            namespaceExport,
        });
    }
}
