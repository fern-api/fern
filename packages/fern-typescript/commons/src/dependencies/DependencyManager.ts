export interface PackageDependencies {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}

export class DependencyManager {
    private dependencies: PackageDependencies = {
        dependencies: {},
        devDependencies: {},
    };

    public addDependency(name: string, version: string, { dev = false }: { dev?: boolean } = {}): void {
        if (dev) {
            this.dependencies.devDependencies[name] = version;
        } else {
            this.dependencies.dependencies[name] = version;
        }
    }

    public getDependencies(): PackageDependencies {
        return {
            dependencies: { ...this.dependencies.dependencies },
            devDependencies: { ...this.dependencies.devDependencies },
        };
    }
}
