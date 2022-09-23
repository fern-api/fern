import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../utils/ModuleSpecifier";

export declare namespace ExternalDependency {
    export interface Init {
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;
    }

    export interface Package {
        name: string;
        version: string;
    }
}

export abstract class ExternalDependency {
    protected abstract readonly PACKAGE: ExternalDependency.Package;
    protected abstract readonly TYPES_PACKAGE: ExternalDependency.Package | undefined;

    private addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    private addDependency: (name: string, version: string, options?: { preferPeer?: boolean }) => void;

    constructor(init: ExternalDependency.Init) {
        this.addImport = init.addImport;
        this.addDependency = init.addDependency;
    }

    protected withNamedImport<T>(namedImport: string, run: (addImport: () => void, namedImport: string) => T): T {
        return this.withImport(namedImport, { namedImports: [namedImport] }, run);
    }

    protected withNamespaceImport<T>(
        namespaceImport: string,
        run: (addImport: () => void, namedImport: string) => T
    ): T {
        return this.withImport(namespaceImport, { namespaceImport }, run);
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
            this.addDependency(this.PACKAGE.name, this.PACKAGE.version);
            if (this.TYPES_PACKAGE != null) {
                this.addDependency(this.TYPES_PACKAGE.name, this.TYPES_PACKAGE.version);
            }
            this.addImport(this.PACKAGE.name, importDeclaration);
        }, importedItem);
    }
}
