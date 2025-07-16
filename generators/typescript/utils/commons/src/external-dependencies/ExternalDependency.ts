import { DependencyManager, DependencyType } from "../dependency-manager/DependencyManager";
import { ImportDeclaration, ImportsManager } from "../imports-manager/ImportsManager";

export declare namespace ExternalDependency {
    export interface Init {
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
    }

    export interface Package {
        name: string;
        // not defined for built-ins
        version?: string;
    }
}

export abstract class ExternalDependency {
    protected abstract readonly PACKAGE: ExternalDependency.Package;
    protected abstract readonly TYPES_PACKAGE: ExternalDependency.Package | undefined;

    private importsManager: ImportsManager;
    private dependencyManager: DependencyManager;

    constructor({ importsManager, dependencyManager }: ExternalDependency.Init) {
        this.importsManager = importsManager;
        this.dependencyManager = dependencyManager;
    }

    protected withNamedImport<T>(
        namedImport: string,
        // eslint-disable-next-line @typescript-eslint/ban-types
        run: (withImport: <F extends Function>(f: F) => F, namedImport: string) => T
    ): T {
        return this.withImport(namedImport, { namedImports: [namedImport] }, run);
    }

    protected withNamespaceImport<T>(
        namespaceImport: string,
        // eslint-disable-next-line @typescript-eslint/ban-types
        run: (withImport: <F extends Function>(f: F) => F, namedImport: string) => T
    ): T {
        return this.withImport(namespaceImport, { namespaceImport }, run);
    }

    protected withDefaultImport<T>(
        defaultImport: string,
        // eslint-disable-next-line @typescript-eslint/ban-types
        run: (withImport: <F extends Function>(f: F) => F, defaultImport: string) => T,
        { isSynthetic = false }: { isSynthetic?: boolean } = {}
    ): T {
        if (isSynthetic) {
            return this.withImport(
                defaultImport,
                {
                    namedImports: [{ name: "default", alias: defaultImport }]
                },
                run
            );
        } else {
            return this.withImport(defaultImport, { defaultImport }, run);
        }
    }

    private withImport<T>(
        importedItem: string,
        importDeclaration: ImportDeclaration,
        // eslint-disable-next-line @typescript-eslint/ban-types
        run: (withImport: <F extends Function>(f: F) => F, importedItem: string) => T
    ): T {
        // eslint-disable-next-line @typescript-eslint/ban-types
        return run(<F extends Function>(f: F): F => {
            const wrapped = (...args: unknown[]) => {
                if (this.PACKAGE.version != null) {
                    this.dependencyManager.addDependency(this.PACKAGE.name, this.PACKAGE.version);
                }
                if (this.TYPES_PACKAGE?.version != null) {
                    this.dependencyManager.addDependency(this.TYPES_PACKAGE.name, this.TYPES_PACKAGE.version, {
                        type: DependencyType.DEV
                    });
                }
                this.importsManager.addImport(this.PACKAGE.name, importDeclaration);

                return f(...args);
            };
            return wrapped as unknown as F;
        }, importedItem);
    }
}
