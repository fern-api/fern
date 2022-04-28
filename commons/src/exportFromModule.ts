import { Directory } from "ts-morph";
import { withSourceFile } from "./withSourceFile";

export declare namespace exportFromModule {
    export interface Args {
        module: Directory;
        pathToExport: string;
        namespaceExport?: string;
    }
}

export function exportFromModule({ module, pathToExport, namespaceExport }: exportFromModule.Args): void {
    withSourceFile({ directory: module, filepath: "index.ts" }, (indexTs) => {
        const moduleSpecifier = module.getRelativePathAsModuleSpecifierTo(pathToExport);
        if (indexTs.getExportDeclaration(moduleSpecifier) == null) {
            indexTs.addExportDeclaration({
                moduleSpecifier,
                namespaceExport,
            });
        }
    });
}
