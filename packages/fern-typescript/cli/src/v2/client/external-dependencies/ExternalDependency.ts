import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../types";

export declare namespace ExternalDependency {
    export interface Init {
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;
    }
}

export abstract class ExternalDependency {
    protected abstract readonly PACKAGE_NAME: string;
    protected abstract readonly VERSION: string;

    private addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    private addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;

    constructor(init: ExternalDependency.Init) {
        this.addImport = init.addImport;
        this.addDependency = init.addDependency;
    }

    protected withNamedImport<T>(namedImport: string, run: (addImport: () => void, namedImport: string) => T): T {
        return this.withImport(namedImport, { namedImports: [namedImport] }, run);
    }

    protected withDefaultImport<T>(defaultImport: string, run: (addImport: () => void, defaultImport: string) => T): T {
        return this.withImport(defaultImport, { defaultImport }, run);
    }

    private withImport<T>(
        importedItem: string,
        importDeclaration: ImportDeclaration,
        run: (addImport: () => void, importedItem: string) => T
    ): T {
        return run(() => {
            this.addDependency(this.PACKAGE_NAME, this.VERSION);
            this.addImport(this.PACKAGE_NAME, importDeclaration);
        }, importedItem);
    }
}
