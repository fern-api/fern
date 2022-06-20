import { Directory } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../codegen/utils/getRelativePathAsModuleSpecifierTo";
import { getOrCreateSourceFile } from "./getOrCreateSourceFile";

export declare namespace exportFromModule {
    export interface Args {
        module: Directory;
        pathToExport: string;
        options?: Options;
    }

    export type Options = NamespaceExportOptions | NamedExportsOptions;

    export interface NamespaceExportOptions {
        type: "namespace";
        namespace: string;
    }

    export interface NamedExportsOptions {
        type: "namedExports";
        exports: string[];
    }
}

export function exportFromModule({ module, pathToExport, options }: exportFromModule.Args): void {
    const indexTs = getOrCreateSourceFile(module, "index.ts");
    const moduleSpecifier = getRelativePathAsModuleSpecifierTo(module, pathToExport);
    if (indexTs.getExportDeclaration(moduleSpecifier) == null) {
        indexTs.addExportDeclaration({
            moduleSpecifier,
            namespaceExport: options?.type === "namespace" ? options.namespace : undefined,
            namedExports: options?.type === "namedExports" ? options.exports : undefined,
        });
    }
}
